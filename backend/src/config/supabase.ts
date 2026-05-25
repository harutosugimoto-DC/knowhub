// config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
}

// anon キーのクライアント（認証確認用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service Role キーのクライアント（RLS をバイパスしてサーバー側で DB 操作）
// ユーザー作成など、anon キーでは権限が足りない操作に使う
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// ユーザーの JWT を使った認証済みクライアント（RLS の authenticated ロールで動作）
export function createUserClient(token: string) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
