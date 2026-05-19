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
        <main>
            <Outlet />
        </main>
    );
}