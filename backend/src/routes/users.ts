// src/routes/users.ts
import { Router } from 'express';
import { supabase, supabaseAdmin, createUserClient } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// プロフィール取得（初回ログイン時は public.users に自動作成）
// GET /profile
router.get('/', requireAuth, async (req, res) => {
  const { id: userId, token } = req.user!;
  const userClient = createUserClient(token);

  // 既存ユーザーを取得
  const { data: existing, error: selectError } = await userClient
    .from('users')
    .select('id, nickname, profile_icon_url')
    .eq('id', userId)
    .maybeSingle();

  if (selectError) {
    console.error('Profile select error:', selectError);
    return res.status(500).json({ error: selectError.message });
  }

  if (existing) {
    return res.json(existing);
  }

  // --- 初回ログイン：Supabase の認証情報から google_id などを取得して INSERT ---
  const { data: { user: authUser } } = await supabase.auth.getUser(token);

  // Google の sub (ユーザーID) を取得
  const googleId =
    (authUser?.user_metadata?.sub as string | undefined) ??
    (authUser?.identities?.[0]?.identity_data?.['sub'] as string | undefined) ??
    '';

  // デフォルトアイコンを使用（Google アカウントの画像は使わない）
  const avatarUrl = process.env.DEFAULT_ICON_URL ?? null;

  const insertClient = supabaseAdmin ?? userClient;

  const { data: newUser, error: insertError } = await insertClient
    .from('users')
    .insert({
      id: userId,
      google_id: googleId,
      nickname: null,
      profile_icon_url: avatarUrl,
    })
    .select('id, nickname, profile_icon_url')
    .single();

  if (insertError) {
    console.error('User insert error:', insertError);
    return res.status(500).json({
      error: `ユーザー作成に失敗しました: ${insertError.message}`,
    });
  }

  return res.json(newUser);
});

// ニックネーム登録・更新
// PATCH /profile/nickname
router.patch('/nickname', requireAuth, async (req, res) => {
  const { id: userId, token } = req.user!;
  const { nickname } = req.body as { nickname?: unknown };

  if (typeof nickname !== 'string' || nickname.trim().length === 0) {
    return res.status(400).json({ error: 'ニックネームを入力してください' });
  }
  if (nickname.trim().length > 10) {
    return res.status(400).json({ error: 'ニックネームは10文字以内で入力してください' });
  }

  const userClient = createUserClient(token);
  const { error } = await userClient
    .from('users')
    .update({ nickname: nickname.trim() })
    .eq('id', userId);

  if (error) {
    console.error('Nickname update error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'ニックネームを登録しました' });
});

// 自分のユーザー情報取得
// GET /api/v1/users/me
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  // ユーザー基本情報取得
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, nickname, profile_icon_url')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    console.error('Supabase error fetching user:', userError);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 質問数取得
  const { count: questionCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null);

  // 回答数取得
  const { count: answerCount } = await supabase
    .from('answers')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null);

  // ベストアンサーに選ばれた回数取得
  const { count: bestAnswerCount } = await supabase
    .from('answers')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .not('best_answer_at', 'is', null);

  // いいねを押された総数取得（質問へのいいね）
  const { data: questionLikes } = await supabase
    .from('question_likes')
    .select('question_id, questions!inner( user_id )')
    .eq('questions.user_id', userId);

  // いいねを押された総数取得（回答へのいいね）
  const { data: answerLikes } = await supabase
    .from('answer_likes')
    .select('answer_id, answers!inner( user_id )')
    .eq('answers.user_id', userId);

  const totalLikeCount = (questionLikes?.length ?? 0) + (answerLikes?.length ?? 0);

  return res.json({
    id: user.id,
    nickname: user.nickname,
    iconUrl: user.profile_icon_url,
    questionCount: questionCount ?? 0,
    answerCount: answerCount ?? 0,
    bestAnswerCount: bestAnswerCount ?? 0,
    totalLikeCount,
  });
});

// 自分が解決した（ベストアンサーに選ばれた）質問を2件取得
// GET /api/v1/users/me/recently-solved
router.get('/me/recently-solved', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  // 自分がベストアンサーに選ばれた回答を取得
  const { data: bestAnswers, error: answerError } = await supabase
    .from('answers')
    .select(`
      id,
      question_id,
      best_answer_at,
      questions (
        id,
        title,
        created_at,
        user_id,
        statuses ( name ),
        users ( nickname, profile_icon_url ),
        question_tags ( tags ( id, name ) ),
        question_likes ( user_id ),
        bookmarks ( user_id ),
        answers ( id, user_id, best_answer_at )
      )
    `)
    .eq('user_id', userId)
    .not('best_answer_at', 'is', null)
    .is('deleted_at', null)
    .order('best_answer_at', { ascending: false })
    .limit(2);

  if (answerError) {
    return res.status(500).json({ error: answerError.message });
  }

  const formatted = (bestAnswers ?? []).map((a: any) => {
    const q = a.questions;
    return {
      id: q.id,
      title: q.title,
      statusId: q.statuses?.name,
      myAction: 'my_answers',
      userName: q.users?.nickname,
      iconUrl: q.users?.profile_icon_url ?? null,
      postingTime: q.created_at,
      likeCount: q.question_likes?.length ?? 0,
      bookmarkCount: q.bookmarks?.length ?? 0,
      replyCount: q.answers?.length ?? 0,
      tagNames: q.question_tags?.map((qt: any) => qt.tags?.name) ?? [],
      isLiked: q.question_likes?.some((l: any) => l.user_id === userId) ?? false,
      isBookmarked: q.bookmarks?.some((b: any) => b.user_id === userId) ?? false,
    };
  });

  return res.json(formatted);
});

// 1ヶ月ごとの回答件数取得
// GET /api/v1/users/:userId/activity?from=2026-01&to=2026-06
router.get('/me/activity', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  let query = supabase
    .from('answers')
    .select('created_at')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (from) {
    query = query.gte('created_at', `${from}-01`);
  }
  if (to) {
    query = query.lte('created_at', `${to}-31`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error fetching activity:', error);
    return res.status(500).json({ error: 'Failed to fetch activity' });
  }

  // fromとtoの間の全月を生成
  const months: string[] = [];
  if (from && to) {
    const current = new Date(`${from}-01`);
    const end = new Date(`${to}-01`);
    while (current <= end) {
      months.push(current.toISOString().slice(0, 7));
      current.setMonth(current.getMonth() + 1);
    }
  }

  // 月ごとに集計
  const monthlyCounts: { [key: string]: number } = {};
  months.forEach((month) => {
    monthlyCounts[month] = 0; // データがない月は0で初期化
  });

  (data ?? []).forEach((answer: any) => {
    const month = answer.created_at.slice(0, 7);
    if (monthlyCounts[month] !== undefined) {
      monthlyCounts[month] += 1;
    }
  });

  const formatted = Object.entries(monthlyCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return res.json(formatted);
});

// プロフィールアイコン取得
// GET /profile/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

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
// PATCH /profile/:userId/icon
router.patch('/:userId/icon', requireAuth, upload.single('icon'), async (req, res) => {
  const { userId } = req.user!.id === req.params.userId ? req.params : { userId: req.user!.id };
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
