import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ステータス一覧取得
// GET /api/v1/statuses
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('statuses')
    .select('id, name');

  if (error) {
    console.error('Supabase error fetching statuses:', error);
    return res.status(500).json({ error: 'Failed to fetch statuses' });
  }

  return res.json(data ?? []);
});

export default router;