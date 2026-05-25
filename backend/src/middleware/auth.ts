import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: '無効なトークンです' });
    return;
  }

  req.user = { id: user.id, token };
  next();
}
