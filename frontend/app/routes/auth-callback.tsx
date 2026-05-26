import { redirect } from "react-router";
import { supabase } from "@/lib/supabase";
import { authService } from "@/api/authService";
import type { Session } from "@supabase/supabase-js";

async function registerAndRedirect(session: Session) {
    localStorage.setItem("token", session.access_token);
    localStorage.setItem("userId", session.user.id);

    try {
        const profile = await authService.getUserProfile();
        // ニックネームが登録済みかどうかのチェック
        const hasNickname = profile.nickname && profile.nickname.trim().length > 0;
        return redirect(hasNickname ? "/top" : "/nickname");

    } catch (err) {
        console.error("コールバック処理中にエラーが発生しました:", err);
    }

    //ここ後で検討
    return redirect("/top");
}

export async function clientLoader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        return registerAndRedirect(session);
    }

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
        setTimeout(() => {
            subscription.unsubscribe();
            resolve(redirect("/"));
        }, 5000);
    });
}

export default function AuthCallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--base-color)]">
            <p className="text-[var(--text-color-black)]">ログイン処理中...</p>
        </div>
    );
}