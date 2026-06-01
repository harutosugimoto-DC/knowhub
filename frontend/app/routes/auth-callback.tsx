import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import { authService } from "@/api/authService";
import { toast } from "@/utils/toast";

export async function clientLoader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return null;

    return new Promise((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                subscription.unsubscribe();
                resolve(null);
            } else if (event === "SIGNED_OUT" || (event !== "INITIAL_SESSION" && !session)) {
                subscription.unsubscribe();
                resolve(null);
            }
        });

        setTimeout(() => {
            subscription.unsubscribe();
            resolve(null);
        }, 5000);
    });
}

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setUser } = useUser();

    useEffect(() => {
        const processLoginAndRouting = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/");
                return;
            }

            localStorage.setItem("token", session.access_token);
            localStorage.setItem("userId", session.user.id);

            try {
                const profile = await authService.getUserProfile();

                setUser({
                    id: profile.id,
                    nickname: profile.nickname,
                    iconUrl: profile.profile_icon_url
                });

                const hasNickname = profile.nickname && profile.nickname.trim().length > 0;
                toast.success('ログインしました。');
                navigate(hasNickname ? "/top" : "/nickname");

            } catch (err) {
                console.error("コールバック処理中にエラーが発生しました:", err);
                navigate("/top");
            }
        };

        processLoginAndRouting();
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--base-color)]">
            <p className="text-[var(--text-color-black)]">ログイン処理中...</p>
        </div>
    );
}