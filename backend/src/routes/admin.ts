import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// 統計情報
// GET /api/v1/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  const [
    { count: userCount },
    { count: questionCount },
    { count: tagCount },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('questions').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('tags').select('id', { count: 'exact', head: true }),
  ]);

  return res.json({
    userCount: userCount ?? 0,
    questionCount: questionCount ?? 0,
    tagCount: tagCount ?? 0,
  });
});

// ユーザー一覧
// GET /api/v1/admin/users?page=1&search=
router.get('/users', requireAdmin, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const search = req.query.search as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('users')
    .select('id, nickname, profile_icon_url, is_admin, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('nickname', `%${search}%`);
  }

  const { data: users, error, count } = await query;

  if (error) {
    console.error('Admin users fetch error:', error);
    return res.status(500).json({ error: 'ユーザー一覧の取得に失敗しました' });
  }

  const userIds = (users ?? []).map((u: any) => u.id);

  const [{ data: questionRows }, { data: answerRows }] = await Promise.all([
    supabaseAdmin.from('questions').select('user_id').in('user_id', userIds).is('deleted_at', null),
    supabaseAdmin.from('answers').select('user_id').in('user_id', userIds).is('deleted_at', null),
  ]);

  const qMap: Record<string, number> = {};
  (questionRows ?? []).forEach((q: any) => { qMap[q.user_id] = (qMap[q.user_id] ?? 0) + 1; });
  const aMap: Record<string, number> = {};
  (answerRows ?? []).forEach((a: any) => { aMap[a.user_id] = (aMap[a.user_id] ?? 0) + 1; });

  const formatted = (users ?? []).map((u: any) => ({
    id: u.id,
    nickname: u.nickname,
    iconUrl: u.profile_icon_url ?? '',
    isAdmin: u.is_admin ?? false,
    createdAt: u.created_at,
    questionCount: qMap[u.id] ?? 0,
    answerCount: aMap[u.id] ?? 0,
  }));

  return res.json({
    data: formatted,
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  });
});

// ユーザー詳細
// GET /api/v1/admin/users/:userId
router.get('/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, nickname, profile_icon_url, is_admin, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }

  const [{ count: questionCount }, { count: answerCount }, { count: bestAnswerCount }] = await Promise.all([
    supabaseAdmin.from('questions').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('deleted_at', null),
    supabaseAdmin.from('answers').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('deleted_at', null),
    supabaseAdmin.from('answers').select('id', { count: 'exact', head: true }).eq('user_id', userId).not('best_answer_at', 'is', null),
  ]);

  return res.json({
    id: (user as any).id,
    nickname: (user as any).nickname,
    iconUrl: (user as any).profile_icon_url ?? '',
    isAdmin: (user as any).is_admin ?? false,
    createdAt: (user as any).created_at,
    questionCount: questionCount ?? 0,
    answerCount: answerCount ?? 0,
    bestAnswerCount: bestAnswerCount ?? 0,
  });
});

// ユーザー削除（完全削除）
// DELETE /api/v1/admin/users/:userId
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const requestingUserId = req.user!.id;

  if (userId === requestingUserId) {
    return res.status(400).json({ error: '自分自身は削除できません' });
  }

  // auth.admin.deleteUser は auth.users を削除し public.users へのカスケードを
  // 引き起こすが、notifications / likes / bookmarks が users.id を NOT NULL FK で
  // 参照しているため先にそれらを削除する必要がある。
  // 質問・回答は user_id を null にして "(退会済み)" として残す。
  await supabaseAdmin.from('notifications').delete().eq('receiver_user_id', userId);
  await supabaseAdmin.from('notifications').delete().eq('sender_user_id', userId);
  await supabaseAdmin.from('question_likes').delete().eq('user_id', userId);
  await supabaseAdmin.from('answer_likes').delete().eq('user_id', userId);
  await supabaseAdmin.from('bookmarks').delete().eq('user_id', userId);
  await supabaseAdmin.from('questions').update({ user_id: null }).eq('user_id', userId);
  await supabaseAdmin.from('answers').update({ user_id: null }).eq('user_id', userId);
  await supabaseAdmin.from('users').delete().eq('id', userId);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error('Auth delete error:', error);
    return res.status(500).json({ error: 'ユーザーの削除に失敗しました' });
  }

  return res.status(200).json({ message: 'ユーザーを削除しました' });
});

// 管理者権限の付与・剥奪
// PATCH /api/v1/admin/users/:userId/admin
router.patch('/users/:userId/admin', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const requestingUserId = req.user!.id;
  const { isAdmin } = req.body as { isAdmin?: boolean };

  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'isAdminはboolean型である必要があります' });
  }
  if (userId === requestingUserId && !isAdmin) {
    return res.status(400).json({ error: '自分自身の管理者権限は剥奪できません' });
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) {
    console.error('Admin toggle error:', error);
    return res.status(500).json({ error: '管理者権限の変更に失敗しました' });
  }

  return res.status(200).json({ message: isAdmin ? '管理者権限を付与しました' : '管理者権限を剥奪しました' });
});

// 質問一覧
// GET /api/v1/admin/questions?page=1&keyword=
router.get('/questions', requireAdmin, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('questions')
    .select(`
      id,
      title,
      created_at,
      statuses ( name ),
      users ( nickname, profile_icon_url ),
      question_tags ( tags ( name ) )
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
  }

  const { data: questions, error, count } = await query;

  if (error) {
    console.error('Admin questions fetch error:', error);
    return res.status(500).json({ error: '質問一覧の取得に失敗しました' });
  }

  const formatted = (questions ?? []).map((q: any) => ({
    id: q.id,
    title: q.title,
    userName: q.users?.nickname ?? '(退会済み)',
    iconUrl: q.users?.profile_icon_url ?? '',
    statusId: q.statuses?.name ?? '',
    tagNames: q.question_tags?.map((qt: any) => qt.tags?.name).filter(Boolean) ?? [],
    postingTime: q.created_at,
  }));

  return res.json({
    data: formatted,
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  });
});

// 質問削除（soft delete）
// DELETE /api/v1/admin/questions/:questionId
router.delete('/questions/:questionId', requireAdmin, async (req, res) => {
  const { questionId } = req.params;

  const { error } = await supabaseAdmin
    .from('questions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', questionId)
    .is('deleted_at', null);

  if (error) {
    console.error('Admin question delete error:', error);
    return res.status(500).json({ error: '質問の削除に失敗しました' });
  }

  return res.status(200).json({ message: '質問を削除しました' });
});

// タグ一覧（使用中の質問数付き）
// GET /api/v1/admin/tags
router.get('/tags', requireAdmin, async (req, res) => {
  const { data: tags, error } = await supabaseAdmin
    .from('tags')
    .select('id, name, question_tags ( question_id )')
    .order('name', { ascending: true });

  if (error) {
    console.error('Admin tags fetch error:', error);
    return res.status(500).json({ error: 'タグ一覧の取得に失敗しました' });
  }

  const formatted = (tags ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    questionCount: t.question_tags?.length ?? 0,
  }));

  return res.json(formatted);
});

// タグ作成
// POST /api/v1/admin/tags
router.post('/tags', requireAdmin, async (req, res) => {
  const { name } = req.body as { name?: unknown };

  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 20) {
    return res.status(400).json({ error: 'タグ名は1〜20文字で入力してください' });
  }

  const trimmedName = name.trim();

  const { data: existing } = await supabaseAdmin
    .from('tags')
    .select('id')
    .eq('name', trimmedName)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: '同名のタグが既に存在します' });
  }

  const { data, error } = await supabaseAdmin
    .from('tags')
    .insert({ name: trimmedName })
    .select('id, name')
    .single();

  if (error || !data) {
    console.error('Tag create error:', error);
    return res.status(500).json({ error: 'タグの作成に失敗しました' });
  }

  return res.status(201).json({ message: `タグ「${(data as any).name}」を作成しました` });
});

// タグ削除（使用中は不可）
// DELETE /api/v1/admin/tags/:tagId
router.delete('/tags/:tagId', requireAdmin, async (req, res) => {
  const { tagId } = req.params;

  const { count } = await supabaseAdmin
    .from('question_tags')
    .select('question_id', { count: 'exact', head: true })
    .eq('tag_id', tagId);

  if ((count ?? 0) > 0) {
    return res.status(409).json({ error: `このタグは${count}件の質問で使用中のため削除できません` });
  }

  const { error } = await supabaseAdmin.from('tags').delete().eq('id', tagId);

  if (error) {
    console.error('Tag delete error:', error);
    return res.status(500).json({ error: 'タグの削除に失敗しました' });
  }

  return res.status(200).json({ message: 'タグを削除しました' });
});

export default router;
