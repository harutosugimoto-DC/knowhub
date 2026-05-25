// ─────────────────────────────────────────────────────────────
// ログイン画面
// ・グローバルHeader（root.tsx）がロゴを表示するため、このファイルにヘッダーは不要
// ・Googleログインボタン押下でOAuth認証を開始する
// ・SupabaseのsignInWithOAuthを利用して認証を実行し、プロフィールの状態に応じて直接画面を振り分ける
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { redirect } from "react-router";
import { createClient } from "@supabase/supabase-js";

// ロゴ画像（assets/logo.webp）
import logo from "../assets/logo.webp";
// CSSモジュールからTailwindに移行したためimport不要
// import styles from "../styles/pages/login.module.css";

// ─────────────────────────────────────────────────────────────
// Supabaseクライアントの初期化
// ※別ファイル（例: src/lib/supabase.ts）で定義している場合は、
// それをimportして使ってください。
// ─────────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────
// GoogleブランドロゴのインラインSVG
// ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// ─────────────────────────────────────────────────────────────
// 【clientLoader】ページ表示前にブラウザ側で実行される処理
// ・Supabaseのセッションを確認
// ・ログイン済みならバックエンドにアクセスしてプロフィール状況を確認し、
// 　新規(null)なら /nickname、既存なら /top へ直接リダイレクトする
// ─────────────────────────────────────────────────────────────
export async function clientLoader() {
    // 1. Supabaseのセッション情報を取得（Google認証から戻ってきた時もここで取得できる）
    const { data: { session } } = await supabase.auth.getSession();
    
    // セッションが存在する場合（ログイン済み または 認証から戻ってきた直後）
    if (session) {
        // auth-guard が参照する userId を localStorage に保存する
        localStorage.setItem("userId", session.user.id);

        try {
            // 2. バックエンドへプロフィール情報を取得しにいく
            const response = await fetch("http://localhost:5000/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            });

            // 3. ユーザーがDBに存在しない場合（新規ユーザー）はニックネーム登録画面へ
            if (response.status === 404) {
                return redirect("/nickname");
            }

            if (response.ok) {
                const data = await response.json();
                const profile = data.profile;

                // 4. nickname が null（初期状態）ならニックネーム登録画面へ直接移動
                if (!profile?.nickname) {
                    return redirect("/nickname");
                } else {
                    // すでに名前が登録されている場合はトップページへ直接移動
                    return redirect("/top");
                }
            }
        } catch (error) {
            console.error("プロフィール状態の確認に失敗しました:", error);
            // エラー時は安全のためにトップページへ逃がす
            return redirect("/top");
        }
    }
    
    // 未ログインの場合はそのままログイン画面を描画する
    return null;
}

export default function Login() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ─────────────────────────────────────────────────────────
    // 【handleGoogleLoginClick】ボタン押下時の処理
    // ・SupabaseのOAuthログイン処理を実行する
    // ─────────────────────────────────────────────────────────
    const handleGoogleLoginClick = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    // 認証完了後にこのログイン画面へ戻ってくるように指定する
                    // 戻ってきた瞬間に上の `clientLoader` が走って振り分け処理が行われます
                    redirectTo: window.location.href,
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
        // ─────────────────────────────────────────────────────
        // ページ全体のラッパー
        // ・min-h-[calc(100vh-60px)]：グローバルHeaderの高さ60px分を引いた残り高さを使う
        // ・flex items-center justify-center：カードをページ中央に配置する
        // ・bg-[var(--base-color)]：index.cssの背景色変数を使用
        // ─────────────────────────────────────────────────────
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-[var(--base-color)] p-[var(--spacing-16)]">

            {/* ── カードを中央に配置するmain ──────────────── */}
            <main className="w-full flex justify-center">

                {/* ── カード本体 ── */}
                {/* bg-white：白背景 */}
                {/* rounded-[var(--radius-big)]：index.cssの角丸変数 */}
                {/* shadow-[var(--box-shadow)]：index.cssの影変数 */}
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