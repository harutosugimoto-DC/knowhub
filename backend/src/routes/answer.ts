import { Router } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ベストアンサー採用
// PATCH /api/v1/answers/:answerId/accept
router.patch('/:answerId/accept', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { answerId } = req.params;

  // 回答を取得して質問IDを確認
  const { data: answer, error: fetchError } = await supabase
    .from('answers')
    .select('id, question_id')
    .eq('id', answerId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !answer) {
    return res.status(404).json({ message: '回答が見つかりません' });
  }

  // 質問の投稿者かどうかを確認
  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('user_id')
    .eq('id', answer.question_id)
    .single();

  if (qError || !question) {
    return res.status(404).json({ message: '質問が見つかりません' });
  }

  if (question.user_id !== userId) {
    return res.status(403).json({ message: '質問者のみベストアンサーを選べます' });
  }

  // ベストアンサーに設定
  const { error: updateError } = await supabase
    .from('answers')
    .update({ best_answer_at: new Date().toISOString() })
    .eq('id', answerId);

  if (updateError) {
    return res.status(500).json({ message: 'ベストアンサーの設定に失敗しました' });
  }

  // 質問のステータスを「解決済み」に変更
  const { data: status } = await supabase
    .from('statuses')
    .select('id')
    .eq('name', '解決済み')
    .single();

  if (status) {
    await supabase
      .from('questions')
      .update({ status_id: status.id })
      .eq('id', answer.question_id);
  }

  return res.status(200).json({ message: 'ベストアンサーを採用しました' });
});

// 回答・返信削除（soft delete）
// DELETE /api/v1/answers/:answerId
router.delete('/:answerId', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { answerId } = req.params;

  // 投稿者本人かどうか確認
  const { data: answer, error: fetchError } = await supabase
    .from('answers')
    .select('id, user_id')
    .eq('id', answerId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !answer) {
    return res.status(404).json({ message: '回答が見つかりません' });
  }

  if (answer.user_id !== userId) {
    return res.status(403).json({ message: '投稿者本人のみ削除できます' });
  }

  const { error: deleteError } = await supabase
    .from('answers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', answerId);

  if (deleteError) {
    return res.status(500).json({ message: '削除に失敗しました' });
  }

  return res.status(200).json({ message: '削除しました' });
});

// いいね追加（回答）
// POST /api/v1/answers/:answerId/like
router.post('/:answerId/like', requireAuth, async (req, res) => {
  const userId = req.user!.id;
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
router.delete('/:answerId/like', requireAuth, async (req, res) => {
  const userId = req.user!.id;
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
