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

// 質問一覧取得
// GET /api/v1/questions?page=1&order=new or likes
router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const order = req.query.order === 'likes' ? 'likes' : 'new';
  const keyword = req.query.keyword as string | undefined;
  const tagIds = req.query.tagIds
  ? (req.query.tagIds as string).split(',')
  : undefined;
const myActions = req.query.myActions
  ? (req.query.myActions as string).split(',')
  : undefined;
const statusNames = req.query.statuses
  ? (req.query.statuses as string).split(',')
  : undefined;
  const limit = 20;
  const offset = (page - 1) * limit;
  const userId = req.user?.id;

  let query = supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      statuses ( name ),
      users ( nickname ),
      question_tags ( tags (id, name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id )
    `, { count: 'exact' }) // ← 総件数を取得
    .is('deleted_at', null)
    .range(offset, offset + limit - 1);

    // キーワードが指定されている場合のみ絞り込む
    if (keyword) {
  query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
}

    // タグ絞り込み
 if (tagIds) {
  query = query.in('question_tags.tag_id', tagIds);
}

  // ステータス絞り込み
  if (statusNames) {
  query = query.in('statuses.name', statusNames);
}

  if (order === 'likes') {
    query = query.order('created_at', { ascending: false }); // いいね順は後述
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: rawData,count,error } = await query;

  if (error) {
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

  // ステータス絞り込み ← 追加
 if (statusNames) {
  filtered = filtered.filter((q: any) =>
    statusNames.includes(q.statuses?.name)
  );
}

  // マイアクション絞り込み
  if (myActions) {
  filtered = filtered.filter((q: any) =>
    myActions.some((action) => {
      if (action === 'my_questions') return q.user_id === userId;
      if (action === 'my_answers') return q.answers?.some((a: any) => a.user_id === userId);
      if (action === 'my_solved') return q.user_id === userId && q.answers?.some((a: any) => a.best_answer_at !== null);
      if (action === 'bookmarked') return q.bookmarks?.some((b: any) => b.user_id === userId);
      return false;
    })
  );
}

  const formatted = filtered.map((q: any) => ({
    id: q.id,
    title: q.title,
    statusId: q.statuses?.name,
    userName: q.users?.nickname,
    postingTime: q.created_at,
    likeCount: q.question_likes?.length ?? 0,
    bookmarkCount: q.bookmarks?.length ?? 0,
    replyCount: q.answers?.length ?? 0,
    tagNames: q.question_tags?.map((qt: any) => qt.tags?.name) ?? [],
    isLiked: q.question_likes?.some((l: any) => l.user_id === userId) ?? false,
    isBookmarked: q.bookmarks?.some((b: any) => b.user_id === userId) ?? false,
  }));

  // いいね順の場合はアプリ側でソート
  if (order === 'likes') {
    formatted.sort((a, b) => b.likeCount - a.likeCount);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);


  return res.json({
    page,
    order,
    keyword: keyword ?? null,
    tagIds: tagIds ?? null,
    myActions: myActions ?? null,
    statuses: statusNames ?? null,
    totalCount,
    totalPages,
    data: formatted,
  });
});

// 質問詳細取得
// GET /api/v1/questions/:questionId
router.get('/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user?.id;

  const { data: rawData, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      created_at,
      statuses ( name ),
      users ( nickname ),
      question_tags ( tags ( name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id )
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
    title: data.title,
    content: data.content,
    statusId: data.statuses?.name,
    userName: data.users?.nickname,
    postingTime: data.created_at,
    likeCount: data.question_likes?.length ?? 0,
    bookmarkCount: data.bookmarks?.length ?? 0,
    replyCount: data.answers?.length ?? 0,
    tagNames: data.question_tags?.map((qt: any) => qt.tags?.name) ?? [],
    isLiked: data.question_likes?.some((l: any) => l.user_id === userId) ?? false,
    isBookmarked: data.bookmarks?.some((b: any) => b.user_id === userId) ?? false,
  };

  return res.json(formatted);
});

// ブックマーク追加
// POST /api/v1/questions/:questionId/bookmark
router.post('/:questionId/bookmark', async (req, res) => {
  const userId = req.user?.id;
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
router.delete('/:questionId/bookmark', async (req, res) => {
  const userId = req.user?.id;
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
router.post('/:questionId/like', async (req, res) => {
  const userId = req.user?.id;
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
router.delete('/:questionId/like', async (req, res) => {
  const userId = req.user?.id;
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