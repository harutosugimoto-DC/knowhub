import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// タグ一覧取得
// GET /api/v1/tags
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name');

  if (error) {
    console.error('Supabase error fetching tags:', error);
    return res.status(500).json({ error: 'タグ一覧を取得できませんでした' });
  }

  return res.json(data ?? []);
});

export default router;