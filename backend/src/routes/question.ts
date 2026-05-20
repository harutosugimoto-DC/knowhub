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

  let query = supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      created_at,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags (
        tags ( id, name )
      ),
      question_likes ( count )
    `)
    .is('deleted_at', null)
    .range(offset, offset + limit - 1);

  if (order === 'likes') {
    query = query.order('question_likes.count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    page,
    order,
    data: data ?? [],
  });
});

// 質問詳細取得
// GET /api/v1/questions/:questionId
router.get('/:questionId', async (req, res) => {
  const { questionId } = req.params;

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      created_at,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags (
        tags ( id, name )
      ),
      question_likes ( count )
    `)
    .eq('id', questionId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Question not found' });
  }

  return res.json(data);
});

export default router;