// src/routes/question.ts
import { Router } from 'express';
import { supabase, createUserClient } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// 質問投稿
// POST /api/v1/questions
router.post('/', requireAuth, async (req, res) => {
  const { id: userId, token } = req.user!;
  const { title, content, tag_ids } = req.body as {
    title?: unknown;
    content?: unknown;
    tag_ids?: unknown;
  };

  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 40) {
    return res.status(400).end();
  }
  if (typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 5000) {
    return res.status(400).end();
  }
  if (!Array.isArray(tag_ids) || tag_ids.length < 1 || tag_ids.length > 5) {
    return res.status(400).end();
  }

  // ユーザーの JWT で動く認証済みクライアント（RLS を authenticated ロールで通過）
  const userClient = createUserClient(token);

  // 初期ステータス「回答募集中」のIDを取得
  const { data: status, error: statusError } = await supabase
    .from('statuses')
    .select('id')
    .eq('name', '回答募集中')
    .single();

  if (statusError || !status) {
    console.error('Status fetch error:', statusError);
    return res.status(500).end();
  }

  // 質問を挿入（認証済みクライアントで RLS を通過）
  const { data: question, error: questionError } = await userClient
    .from('questions')
    .insert({
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      status_id: status.id,
    })
    .select('id')
    .single();

  if (questionError || !question) {
    console.error('Supabase error inserting question:', questionError);
    return res.status(500).end();
  }

  // question_tagsを挿入（認証済みクライアントで RLS を通過）
  const tagInserts = (tag_ids as string[]).map((tagId) => ({
    question_id: question.id,
    tag_id: tagId,
  }));

  const { error: tagError } = await userClient
    .from('question_tags')
    .insert(tagInserts);

  if (tagError) {
    console.error('Supabase error inserting question_tags:', tagError);
    await userClient.from('questions').delete().eq('id', question.id);
    return res.status(500).end();
  }

  return res.status(201).json({ questionId: question.id });
});

// 質問削除（soft delete）
// DELETE /api/v1/questions/:questionId
router.delete('/:questionId', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  // 投稿者本人かどうか確認
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('id, user_id')
    .eq('id', questionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !question) {
    return res.status(404).json({ message: '質問が見つかりません' });
  }

  if (question.user_id !== userId) {
    return res.status(403).json({ message: '投稿者本人のみ削除できます' });
  }

  const { error: deleteError } = await supabase
    .from('questions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', questionId);

  if (deleteError) {
    return res.status(500).json({ message: '削除に失敗しました' });
  }

  return res.status(200).json({ message: '削除しました' });
});

// 質問一覧取得
// GET /api/v1/questions?page=1&order=new or likes
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const page = Number(req.query.currentPage) || 1;
  const order = req.query.order as string | undefined ?? 'new';
  const keyword = req.query.keyword as string | undefined;
  const statusIds = req.query['statusIds[]']
  ? [req.query['statusIds[]']].flat() as string[]
  : undefined;

  const tagIds = req.query['tagIds[]']
  ? [req.query['tagIds[]']].flat() as string[]
  : undefined;

  const myActions = req.query['myActions[]']
  ? [req.query['myActions[]']].flat() as string[]
  : undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  // 💡 【追加】ステップ1: 絞り込み条件に合う質問IDを事前抽出
  let targetIds: string[] | null = null;
  if (tagIds || statusIds || myActions || keyword) {
    let idQuery = supabase.from('questions').select('id, user_id, status_id, question_tags(tag_id), bookmarks(user_id), answers(user_id, best_answer_at)').is('deleted_at', null);
    if (keyword) idQuery = idQuery.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    const { data: idData } = await idQuery;
    let idFiltered = idData ?? [];
    if (tagIds) idFiltered = idFiltered.filter((q: any) => tagIds.every((id) => q.question_tags?.some((qt: any) => qt.tag_id === id)));
    if (statusIds) idFiltered = idFiltered.filter((q: any) => statusIds.includes(q.status_id));
    if (myActions) {
      idFiltered = idFiltered.filter((q: any) => myActions.some((action) => {
        if (action === 'my_questions') return q.user_id === userId;
        if (action === 'my_answers') return q.answers?.some((a: any) => a.user_id === userId);
        if (action === 'my_solved') return q.user_id !== userId && q.answers?.some((a: any) => a.user_id === userId && a.best_answer_at !== null);
        if (action === 'bookmarked') return q.bookmarks?.some((b: any) => b.user_id === userId);
        return false;
      }));
    }
    targetIds = idFiltered.map((q: any) => q.id);
    if (targetIds.length === 0) {
      return res.json({ currentPage: page, order, keyword: keyword ?? null, tagId: tagIds ?? null, myActions: myActions ?? null, statusId: statusIds ?? null, totalCount: 0, totalPages: 0, data: [] });
    }
  }

  let query = supabase
    .from('questions')
    .select(`
     id,
      title,
      created_at,
      user_id,
      status_id,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags ( tags (id, name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id, user_id, best_answer_at, parent_answer_id, deleted_at )
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (targetIds) query = query.in('id', targetIds); // 💡 【追加】抽出したIDでDB側で絞り込む

  query = query.range(offset, offset + limit - 1); // 💡 【位置調整】

    // キーワードが指定されている場合のみ絞り込む
    if (keyword) {
  query = query.ilike('title', `%${keyword}%`);
}



  if (order === 'newAsc') {
  query = query.order('created_at', { ascending: true });
    } else {
  query = query.order('created_at', { ascending: false });
    }

  const { data: rawData,count,error } = await query;

  if (error) {
    // PGRST103: ページ範囲外（総件数より大きいオフセットを指定した場合）
    // → 空リストを正常レスポンスとして返す
    if (error.code === 'PGRST103') {
      return res.json({
        currentPage: page,
        order,
        keyword: keyword ?? null,
        tagId: tagIds ?? null,
        myActions: myActions ?? null,
        statusId: statusIds ?? null,
        totalCount: 0,
        totalPages: 0,
        data: [],
      });
    }
    console.error('Supabase error fetching questions:', error);
    return res.status(500).json({ error: error.message });
  }

 let filtered = rawData ?? [];

  // タグ絞り込み
  if (tagIds) {
  filtered = filtered.filter((q: any) =>
    tagIds.every((tagId) =>
      q.question_tags?.some((qt: any) => qt.tags?.id === tagId)
    )
  );
}

  // ステータス絞り込み
 if (statusIds) {
    filtered = filtered.filter((q: any) =>
      statusIds.includes(q.status_id)
    );
  }

  // マイアクション絞り込み
  if (myActions) {
  filtered = filtered.filter((q: any) =>
    myActions.some((action) => {
      if (action === 'my_questions') return q.user_id === userId;
      if (action === 'my_answers') return q.answers?.some((a: any) => a.user_id === userId && a.deleted_at === null);
      if (action === 'myhttps://github.com/harutosugimoto-DC/knowhub/pull/204/conflict?name=backend%252Fsrc%252Froutes%252Fquestion.ts&ancestor_oid=183e9f84b45a71c07031a793644f7ad81b2768e7&base_oid=c89795ae37302860469563e199df62e3c30e9cba&head_oid=cf24ca31f9d80c13e0e26526112d9b1f0bc6e709_solved') return q.user_id !== userId && q.answers?.some((a: any) => a.user_id === userId && a.best_answer_at !== null);
      if (action === 'bookmarked') return q.bookmarks?.some((b: any) => b.user_id === userId);
      return false;
    })
  );
}

 const formatted = filtered.map((q: any) => {
  const actions: string[] = [];

  if (q.user_id === userId) actions.push('my_questions');
  if (q.answers?.some((a: any) => a.user_id === userId && a.deleted_at === null)) actions.push('my_answers');

  if (q.answers?.some((a: any) => a.user_id === userId && a.best_answer_at !== null)) actions.push('my_solved');


  return {
    id: q.id,
    title: q.title,
    iconUrl: q.users?.profile_icon_url ?? '',
    statusId: q.statuses?.name,
    userName: q.users?.nickname,
    postingTime: q.created_at,
    likeCount: q.question_likes?.length ?? 0,
    bookmarkCount: q.bookmarks?.length ?? 0,
    replyCount: q.answers?.length ?? 0,
    tagNames: q.question_tags?.map((qt: any) => qt.tags?.name) ?? [],
    isLiked: q.question_likes?.some((l: any) => l.user_id === userId) ?? false,
    isBookmarked: q.bookmarks?.some((b: any) => b.user_id === userId) ?? false,
    myActions: actions,
  };
});

  // いいね順の場合はアプリ側でソート
  if (order === 'likesDesc') {
  formatted.sort((a, b) => b.likeCount - a.likeCount);// 降順
    } else if (order === 'likesAsc') {
  formatted.sort((a, b) => a.likeCount - b.likeCount);// 昇順
    }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);


  return res.json({
    currentPage: page,
    order,
    keyword: keyword ?? null,
    tagId: tagIds ?? null,
    myActions: myActions ?? null,
    statusId: statusIds ?? null,
    totalCount,
    totalPages,
    data: formatted,
  });
});

// 質問詳細取得
// GET /api/v1/questions/:questionId
router.get('/:questionId', requireAuth, async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user!.id;

  const { data: rawData, error } = await supabase
    .from('questions')
    .select(`
      id,
      user_id,
      title,
      content,
      created_at,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags ( tags ( name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id, parent_answer_id, deleted_at )
    `)
    .eq('id', questionId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    return res.status(500).end();
  }

  if (!rawData) {
    return res.status(404).end();
  }

  const data = rawData as any;

  const formatted = {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    statusId: data.statuses?.name,
    userName: data.users?.nickname,
    iconURL: data.users?.profile_icon_url ?? '',
    postingTime: data.created_at,
    likeCount: data.question_likes?.length ?? 0,
    bookmarkCount: data.bookmarks?.length ?? 0,
    replyCount: data.answers?.filter((a: any) => a.parent_answer_id === null && a.deleted_at === null).length ?? 0,
    tagNames: data.question_tags?.map((qt: any) => qt.tags?.name) ?? [],
    isLiked: data.question_likes?.some((l: any) => l.user_id === userId) ?? false,
    isBookmarked: data.bookmarks?.some((b: any) => b.user_id === userId) ?? false,
  };

  return res.json(formatted);
});

// 回答・返信一覧取得（ツリー構造で返す）
// GET /api/v1/questions/:questionId/answers
router.get('/:questionId/answers', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  const { data, error } = await supabase
    .from('answers')
    .select(`
      id,
      user_id,
      parent_answer_id,
      content,
      created_at,
      best_answer_at,
      users ( nickname, profile_icon_url ),
      answer_likes ( user_id )
    `)
    .eq('question_id', questionId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const items = (data ?? []) as any[];

  // フラットなリストをツリー構造に変換
  const map = new Map<string, any>();
  items.forEach((item) => {
    map.set(item.id, {
      id: item.id,
      userId: item.user_id,
      userName: item.users?.nickname ?? '不明',
      iconURL: item.users?.profile_icon_url ?? '',
      content: item.content,
      postingTime: item.created_at,
      likeCount: item.answer_likes?.length ?? 0,
      isLiked: item.answer_likes?.some((l: any) => l.user_id === userId) ?? false,
      isBestAnswer: item.best_answer_at !== null,
      replies: [],
    });
  });

  const roots: any[] = [];
  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parent_answer_id) {
      const parent = map.get(item.parent_answer_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return res.json(roots);
});

// 回答・返信投稿
// POST /api/v1/questions/:questionId/answers
router.post('/:questionId/answers', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;
  const { content, parentAnswerId } = req.body as {
    content?: unknown;
    parentAnswerId?: unknown;
  };

  if (typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 5000) {
    return res.status(400).json({ message: 'contentが不正です' });
  }

  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: questionId,
      user_id: userId,
      content: content.trim(),
      parent_answer_id: typeof parentAnswerId === 'string' ? parentAnswerId : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Supabase error inserting answer:', error);
    return res.status(500).json({ message: '回答の投稿に失敗しました' });
  }

  if (!parentAnswerId) {
    const { data: interiStatus } = await supabase
      .from('statuses')
      .select('id')
      .eq('name', '整理中')
      .single();

    const { data: currentQuestion } = await supabase
      .from('questions')
      .select('statuses ( name )')
      .eq('id', questionId)
      .single();

    const currentStatusName = (currentQuestion as any)?.statuses?.name;

    if (interiStatus && currentStatusName !== '解決済み') {
      await supabase
        .from('questions')
        .update({ status_id: interiStatus.id })
        .eq('id', questionId);
    }
  }

  return res.status(201).json({ answerId: data.id });
});

// ブックマーク追加
// POST /api/v1/questions/:questionId/bookmark
router.post('/:questionId/bookmark', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  if (existing) {
    return res.status(409).end();
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, question_id: questionId });

  if (error) {
    console.error('Supabase error adding bookmark:', error);
    return res.status(500).end();
  }

  return res.status(201).json({ message: 'ブックマークに追加しました' });
});

// ブックマーク解除
// DELETE /api/v1/questions/:questionId/bookmark
router.delete('/:questionId/bookmark', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);

  if (error) {
    console.error('Supabase error removing bookmark:', error);
    return res.status(500).end();
  }

  return res.status(200).json({ message: 'ブックマークを解除しました' });
});

// いいね追加
// POST /api/v1/questions/:questionId/like
router.post('/:questionId/like', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  const { data: existing } = await supabase
    .from('question_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();

  if (existing) {
    return res.status(409).end();
  }

  const { error } = await supabase
    .from('question_likes')
    .insert({ user_id: userId, question_id: questionId });

  if (error) {
    console.error('Supabase error adding like:', error);
    return res.status(500).end();
  }

  return res.status(201).json({ message: 'いいねしました' });
});

// いいね解除
// DELETE /api/v1/questions/:questionId/like
router.delete('/:questionId/like', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { questionId } = req.params;

  const { error } = await supabase
    .from('question_likes')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);

  if (error) {
    console.error('Supabase error removing like:', error);
    return res.status(500).end();
  }

  return res.status(200).json({ message: 'いいねを解除しました' });
});

export default router;
