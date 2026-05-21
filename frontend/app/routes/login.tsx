// ─────────────────────────────────────────────────────────────
// ログイン画面
// ・グローバルHeader（root.tsx）がロゴを表示するため、このファイルにヘッダーは不要
// ・Googleログインボタン押下でOAuth認証を開始する
// ・認証ロジックは別フェーズでSupabaseのsignInWithOAuthに置き換え予定
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { redirect } from "react-router";

// ロゴ画像（assets/logo.webp）
import logo from "../assets/logo.webp";
// このページ専用のCSSモジュール
import styles from "../styles/pages/login.module.css";

// ─────────────────────────────────────────────────────────────
// GoogleブランドロゴのインラインSVG
// ・@mui/icons-material にはブランドロゴが含まれないため直接定義する
// ・外部ライブラリ追加を避けるためインラインで記述する
// ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

// ─────────────────────────────────────────────────────────────
// 【clientLoader】ページ表示前にブラウザ側で実行される処理
// ・localStorageにuserIdがある場合はすでにログイン済みと判断する
// ・ログイン済みならトップページへリダイレクトしてログイン画面を表示しない
// ・※ 認証フェーズでSupabaseのセッション確認に置き換え予定
// ─────────────────────────────────────────────────────────────
export async function clientLoader() {
    const userId = localStorage.getItem("userId");
    if (userId) {
        return redirect("/top");
    }
    return null;
}

export default function Login() {

    // ─────────────────────────────────────────────────────────
    // UIの状態管理
    // isLoading：ボタン連打防止とローディング表示のために使う
    //   → true の間はボタンを非活性にして視覚的に処理中を伝える
    // error：ログイン失敗時のエラーメッセージを保持する
    //   → null なら非表示、文字列がセットされたら画面に表示する
    // ─────────────────────────────────────────────────────────
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ─────────────────────────────────────────────────────────
    // 【handleGoogleLoginClick】ボタン押下時の処理
    // ・現在はUIフェーズのため、ローディング状態のセットのみ行う
    // ・※ 認証フェーズでSupabaseのsignInWithOAuth()に置き換え予定
    // ─────────────────────────────────────────────────────────
    const handleGoogleLoginClick = () => {
        setIsLoading(true);
        setError(null);
        // TODO: 認証フェーズで以下に置き換える
        // supabase.auth.signInWithOAuth({ provider: "google", ... })
    };

    return (
        // ─────────────────────────────────────────────────────
        // ページ全体のラッパー
        // ・グローバルHeader（root.tsx）の高さ60px分をcalcで引いた高さを使う
        // ・カードをページ中央に配置する役割を担う
        // ─────────────────────────────────────────────────────
        <div className={styles.pageWrapper}>

            {/* ── カードを中央に配置するmain ──────────────── */}
            <main className={styles.main}>
                <div className={styles.card}>

                    {/* ── アプリアイコン ── */}
                    <img
                        src={logo}
                        alt="Know Hub アイコン"
                        className={styles.cardIcon}
                    />

                    {/* ── テキストブロック ── */}
                    <div className={styles.cardTextBlock}>
                        <h1 className={styles.cardTitle}>Know Hub</h1>
                        {/* サブテキスト2行 */}
                        <p className={styles.cardSubText}>社内の「わからない」を解決する</p>
                        <p className={styles.cardSubText}>質問・回答プラットフォーム</p>
                    </div>

                    {/* ── エラーメッセージ ── */}
                    {/* errorがnullでないときだけ表示する（条件付きレンダリング） */}
                    {error && (
                        <p className={styles.errorText} role="alert">
                            {error}
                        </p>
                    )}

                    {/* ── Googleログインボタン ── */}
                    {/*
                        disabled：isLoadingがtrueの間はクリックを無効化する
                        → ボタン連打による重複リクエストを防ぐ
                    */}
                    <button
                        onClick={handleGoogleLoginClick}
                        disabled={isLoading}
                        className={styles.googleButton}
                    >
                        {/* Googleブランドロゴ（インラインSVG） */}
                        <GoogleIcon />
                        {/* ローディング中はテキストを切り替えてフィードバックを出す */}
                        {isLoading ? "処理中..." : "Googleでログイン"}
                    </button>

                </div>
            </main>

        </div>
    );
}