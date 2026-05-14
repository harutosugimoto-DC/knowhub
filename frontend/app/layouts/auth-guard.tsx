// app/layouts/auth-guard.tsx
import { Outlet, redirect, useNavigate } from "react-router";

export async function clientLoader() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        return redirect("/");
    }

    return { userId };
}

export default function AuthGuard() {
    // ページ遷移を行うためのフックを呼び出す
    const navigate = useNavigate();

    // ログアウトボタンが押された時の処理
    const handleLogout = () => {
        localStorage.removeItem("userId");
        
        navigate("/", { replace: true });
    };

    return (
        <div>
            {/* 認証済みユーザー向けの共通ヘッダー */}
            <header style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                padding: "1rem", 
                backgroundColor: "#f3f4f6",
                borderBottom: "1px solid #e5e7eb"
            }}>
                <div style={{ fontWeight: "bold" }}>マイアプリ</div>
                <button 
                    onClick={handleLogout} 
                    style={{ padding: "0.25rem 0.75rem", cursor: "pointer" }}
                >
                    ログアウト
                </button>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}