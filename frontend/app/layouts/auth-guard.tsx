// app/layouts/auth-guard.tsx
import { Outlet, redirect } from "react-router";
import { getMyData } from "@/api/userService"; // 💡 ユーザーデータ取得APIをインポート

// 💡 引数に { request } を追加して、今どのURLにいるかを取得できるようにします
export async function clientLoader({ request }: { request: Request }) {
    const userId = localStorage.getItem("userId");

    // ─── 1. ログインチェック ───
    if (!userId) {
        return redirect("/");
    }

    // ─── 2. 【最重要】無限ループ防止のガード ───
    const url = new URL(request.url);
    
    // もし今いるページがすでに「/nickname」なら、これ以降のチェック（リダイレクト）をスキップする
    if (url.pathname === "/nickname") {
        return { userId };
    }

    // ─── 3. ニックネーム設定チェック ───
    try {
        const userData = await getMyData();

        // ニックネームが登録されていなければ、登録画面へ強制リダイレクト
        if (!userData || !userData.nickname) {
            return redirect("/nickname");
        }
    } catch (error) {
        console.error("ユーザーデータの取得に失敗しました:", error);
        return redirect("/");
    }

    return { userId };
}

export default function AuthGuard() {
    return (
        <main>
            <Outlet />
        </main>
    );
}