// OAuth コールバック専用ルート
// Google 認証後にここへリダイレクトされ、セッション確立 → public.users 登録 → 振り分け
import { redirect } from "react-router";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function registerAndRedirect(session: Session) {
    localStorage.setItem("userId", session.user.id);

    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${session.access_token}` },
        });

        if (response.ok) {
            const profile = await response.json() as { nickname: string | null };
            // nickname が null・空文字どちらでも /nickname へ
            const hasNickname = profile.nickname && profile.nickname.trim().length > 0;
            return redirect(hasNickname ? "/top" : "/nickname");
        }

        console.error("プロフィール取得エラー:", response.status, await response.text().catch(() => ""));
    } catch (err) {
        console.error("プロフィール取得ネットワークエラー:", err);
    }

    // バックエンドエラー時もトップへ（セッションは有効）
    return redirect("/top");
}

export async function clientLoader() {
    // 1. すでにセッションがある場合（リロードなど）
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        return registerAndRedirect(session);
    }

    // 2. OAuth コールバック直後はセッション確立が非同期なので onAuthStateChange で待つ
    return new Promise<Response>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                subscription.unsubscribe();
                resolve(registerAndRedirect(session));
            } else if (event === "SIGNED_OUT" || (event !== "INITIAL_SESSION" && !session)) {
                subscription.unsubscribe();
                resolve(redirect("/"));
            }
        });

        // 5秒タイムアウト（念のため）
        setTimeout(() => {
            subscription.unsubscribe();
            resolve(redirect("/"));
        }, 5000);
    });
}

// コールバック処理中のローディング表示
export default function AuthCallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--base-color)]">
            <p className="text-[var(--text-color-black)]">ログイン処理中...</p>
        </div>
    );
}
