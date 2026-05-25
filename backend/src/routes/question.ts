// src/routes/question.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// 質問一覧取得
// GET /api/v1/questions?page=1&order=new or likes
router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const order = req.query.order === 'likes' ? 'likes' : 'new';
  const keyword = req.query.keyword as string | undefined;
  const tagId = req.query.tagId as string | undefined;
  const myAction = req.query.myAction as string | undefined;
  const statusName = req.query.status as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;
  const userId = req.user?.id;

  let query = supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      user_id,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags ( tags (id, name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id, user_id, best_answer_at )
    `, { count: 'exact' }) // ← 総件数を取得
    .is('deleted_at', null)
    .range(offset, offset + limit - 1);

    // キーワードが指定されている場合のみ絞り込む
    if (keyword) {
  query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
}

    // タグ絞り込み
  if (tagId) {
    query = query.eq('question_tags.tag_id', tagId);
  }

  // ステータス絞り込み
  if (statusName) {
    query = query.eq('statuses.name', statusName);
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
  if (tagId) {
    filtered = filtered.filter((q: any) =>
      q.question_tags?.some((qt: any) => qt.tags?.id === tagId)
    );
  }

  // ステータス絞り込み ← 追加
  if (statusName) {
    filtered = filtered.filter((q: any) =>
      q.statuses?.name === statusName
    );
  }

  // マイアクション絞り込み
  if (myAction === 'my_questions') {
    filtered = filtered.filter((q: any) => q.user_id === userId);
  } else if (myAction === 'my_answers') {
    filtered = filtered.filter((q: any) =>
      q.answers?.some((a: any) => a.user_id === userId)
    );
  } else if (myAction === 'my_solved') {
    filtered = filtered.filter((q: any) =>
      q.user_id === userId &&
      q.answers?.some((a: any) => a.best_answer_at !== null)
    );
  } else if (myAction === 'bookmarked') {
    filtered = filtered.filter((q: any) =>
      q.bookmarks?.some((b: any) => b.user_id === userId)
    );
  }

   const formatted = filtered.map((q: any) => ({
    id: q.id,
    title: q.title,
    statusId: q.statuses?.name,
    userName: q.users?.nickname,
    iconUrl: q.users?.profile_icon_url ?? null,
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
    tagId: tagId ?? null,
    myAction: myAction ?? null,
    status: statusName ?? null,
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
    return res.status(500).json({ error: error.message });
  }

  if (!rawData) {
    return res.status(404).json({ error: 'Question not found' });
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
    return res.status(409).json({ error: '既にブックマーク済みです' });
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, question_id: questionId });

  if (error) {
    console.error('Supabase error adding bookmark:', error);
    return res.status(500).json({ error: 'ブックマークの追加に失敗しました' });
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
    return res.status(500).json({ error: 'ブックマークの解除に失敗しました' });
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
    return res.status(409).json({ error: '既にいいね済みです' });
  }

  const { error } = await supabase
    .from('question_likes')
    .insert({ user_id: userId, question_id: questionId });

  if (error) {
    console.error('Supabase error adding like:', error);
    return res.status(500).json({ error: 'いいねの追加に失敗しました' });
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
    return res.status(500).json({ message: 'いいねの解除に失敗しました' });
  }

  return res.status(200).json({ message: 'いいねを解除しました' });
});

export default router;