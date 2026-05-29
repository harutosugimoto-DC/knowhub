import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import logo from "../assets/logo.webp";
import { useNavigate } from "react-router";
import { useUser } from "@/contexts/UserContext";

// GoogleブランドロゴのインラインSVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { user } = useUser();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // user情報が存在し、かつ nickname が設定されている場合
        if (user && user.nickname) {
            // `{ replace: true }` を入れることで、戻るボタンを押したときの無限ループを防ぎます
            navigate("/top", { replace: true });
        }
        else if (user) {
            navigate("/nickname", { replace: true })
        }
    }, [user, navigate]);

    if (user && user.nickname) {
        return null;
    }

    const handleGoogleLoginClick = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    // 専用コールバックルートへリダイレクト（セッション確立 → 振り分け）
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) throw authError;

        } catch (err: any) {
            console.error("Googleログインエラー:", err);
            setError(err.message || "ログインに失敗しました。もう一度お試しください。");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--base-color)] p-[var(--spacing-16)]">
            <main className="w-full flex justify-center">
                <div className="bg-white rounded-[var(--radius-big)] 
                shadow-[var(--box-shadow)] px-[var(--spacing-32)]
                 py-[var(--spacing-48)] w-[600px] h-[400px]
                 flex flex-col items-center gap-[var(--spacing-24)]">

                    <img
                        src={logo}
                        alt="Know Hub アイコン"
                        className="w-16 h-[59px] rounded-[var(--radius-small)] object-contain"
                    />

                    {/* ── テキストブロック ── */}
                    <div className="flex flex-col items-center gap-[var(--spacing-8)] text-center">
                        <h1 className="text-[length:var(--font-size-big)] font-normal text-[var(--main-color)]">
                            Know Hub
                        </h1>
                        {/* サブテキスト2行 */}
                        <p className="text-[length:var(--font-size-normal)] 
                        text-[var(--text-color-black)] leading-[1.6]">
                            社内の「わからない」を解決する
                        </p>
                        <p className="text-[length:var(--font-size-normal)] text-[var(--text-color-black)] leading-[1.6]">
                            質問・回答プラットフォーム
                        </p>
                    </div>

                    {error && (
                        <p
                            className="text-sm text-[var(--danger-color)] text-center w-full"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                    <button
                        onClick={handleGoogleLoginClick}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-[var(--spacing-12)] w-[450px] h-[60px] py-[var(--spacing-12)] px-[var(--spacing-16)] bg-white border border-[var(--light-gray)] rounded-[var(--radius-small)] text-[length:var(--font-size-normal)] text-[var(--text-color-black)] cursor-pointer transition-opacity duration-200 ease-in-out hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <GoogleIcon />
                        {isLoading ? "処理中..." : "Googleでログイン"}
                    </button>
                </div>
            </main>
        </div>
    );
}