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
    sender:sender_user_id ( nickname, profile_icon_url )
  `)
    .eq('receiver_user_id', userId)
    .order('created_at', { ascending: false });
        
  if (error) {
    return res.status(500).json({ error: error.message });
  }


  return res.json(data ?? []);
});

export default router;