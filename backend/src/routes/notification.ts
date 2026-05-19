import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// 通知の取得
router.get('/', async (req, res) => {
  const userId = req.user?.id ?? 'f664ea31-09be-40d7-8b72-0b0c5e6e713c'; // 仮のユーザーID（認証実装後に置き換え）

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