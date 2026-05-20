// src/routes/question.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// 質問一覧取得
// GET /api/v1/questions?page=1&order=new or likes
router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const order = req.query.order === 'likes' ? 'likes' : 'new';
  const limit = 20;
  const offset = (page - 1) * limit;
  const userId = req.user?.id ?? 'c0df35c7-2f4d-4d73-bcb7-119ec96ab474'; // 仮のUUID

  let query = supabase
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      statuses ( name ),
      users ( nickname ),
      question_tags ( tags ( name ) ),
      question_likes ( user_id ),
      bookmarks ( user_id ),
      answers ( id )
    `)
    .is('deleted_at', null)
    .range(offset, offset + limit - 1);

  if (order === 'likes') {
    query = query.order('created_at', { ascending: false }); // いいね順は後述
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: rawData, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const formatted = (rawData ?? []).map((q: any) => ({
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

  return res.json({
    page,
    order,
    data: formatted,
  });
});

// 質問詳細取得
// GET /api/v1/questions/:questionId
router.get('/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user?.id ?? 'c0df35c7-2f4d-4d73-bcb7-119ec96ab474'; // 仮のUUID

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

export default router;