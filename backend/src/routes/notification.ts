import { Router } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// 通知の取得
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user!.id;

const { data, error } = await supabase
    .from('notifications')
    .select(`
    id,
    is_read,
    created_at,
    link_url,
    notification_types ( name ),
    sender:sender_user_id ( nickname, profile_icon_url ),
    questions ( title )
  `)
    .eq('receiver_user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
        
  if (error) {
    return res.status(500).json({ error: error.message });
  }


  return res.json(data ?? []);
});

// 通知既読
// PATCH /api/v1/notifications/:notificationId/read
router.patch('/:notificationId/read', requireAuth, async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user!.id;

  // 自分宛ての通知かチェック
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('id', notificationId)
    .eq('receiver_user_id', userId)
    .maybeSingle();

  if (!existing) {
    return res.status(404).end();
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Supabase error updating notification:', error);
    return res.status(500).end();
  }

  return res.status(204).end();
});

export default router;