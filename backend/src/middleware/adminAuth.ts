import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', req.user!.id)
      .single();

    if (!user?.is_admin) {
      res.status(403).json({ error: '管理者権限が必要です' });
      return;
    }

    next();
  });
}
