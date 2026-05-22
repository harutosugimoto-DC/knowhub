import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// いいね追加（回答）
// POST /api/v1/answers/:answerId/like
router.post('/:answerId/like', async (req, res) => {
  const userId = req.user?.id;
  const { answerId } = req.params;

  const { data: existing } = await supabase
    .from('answer_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('answer_id', answerId)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: '既にいいね済みです' });
  }

  const { error } = await supabase
    .from('answer_likes')
    .insert({ user_id: userId, answer_id: answerId });

  if (error) {
    console.error('Supabase error adding like:', error);
    return res.status(500).json({ message: 'いいねの追加に失敗しました' });
  }

  return res.status(201).json({ message: 'いいねしました' });
});

// いいね解除（回答）
// DELETE /api/v1/answers/:answerId/like
router.delete('/:answerId/like', async (req, res) => {
  const userId = req.user?.id;
  const { answerId } = req.params;

  const { error } = await supabase
    .from('answer_likes')
    .delete()
    .eq('user_id', userId)
    .eq('answer_id', answerId);

  if (error) {
    console.error('Supabase error removing like:', error);
    return res.status(500).json({ error: 'いいねの解除に失敗しました' });
  }

  return res.status(200).json({ message: 'いいねを解除しました' });
});

export default router;