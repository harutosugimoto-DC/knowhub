// src/routes/profile.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// プロフィールアイコン取得
router.get('/icon', async (req, res) => {
  const userId = req.user?.id;

  const { data, error } = await supabase
    .from('users')
    .select('profile_icon_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Supabase error fetching profile icon:', error);
    return res.status(500).json({ error: 'Failed to fetch profile icon URL' });
  }

  if (!data) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  return res.json({ profile_icon_url: data.profile_icon_url });
});

// プロフィールアイコン更新
// PATCH /profile/icon
router.patch('/icon', upload.single('icon'), async (req, res) => {
  const userId = req.user?.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'ファイルがありません' });
  }

  // 現在のアイコンURLを取得
  const { data: currentUser } = await supabase
    .from('users')
    .select('profile_icon_url')
    .eq('id', userId)
    .maybeSingle();

  // デフォルトアイコン以外であれば古いアイコンをStorageから削除
  const isDefaultIcon = currentUser?.profile_icon_url === process.env.DEFAULT_ICON_URL;
  if (currentUser?.profile_icon_url && !isDefaultIcon) {
    const oldPath = currentUser.profile_icon_url.split('/avatars/')[1];
    await supabase.storage.from('avatars').remove([oldPath]);
  }

  // 新しいアイコンをStorageにアップロード
  const filePath = `icons/${userId}/${Date.now()}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return res.status(500).json({ error: 'アップロードに失敗しました' });
  }

  // 公開URLを取得してDBを更新
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { data, error: updateError } = await supabase
    .from('users')
    .update({ profile_icon_url: publicUrl })
    .eq('id', userId)
    .select('profile_icon_url')
    .single();

  if (updateError) {
    console.error('Supabase error updating profile icon:', updateError);
    return res.status(500).json({ error: 'DB更新に失敗しました' });
  }

  return res.json({ profile_icon_url: data.profile_icon_url });
});

export default router;