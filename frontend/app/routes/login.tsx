// app/routes/login.tsx
import { Form, redirect } from "react-router";

// 【Loader】ページ表示前に実行される（ブラウザで動く）
export async function clientLoader() {
    const userId = localStorage.getItem("userId");

    // すでにログイン済みならトップへリダイレクト
    if (userId) {
        return redirect("/top");
    }
    return null;
}

// 【Action】Form送信時に実行される（ブラウザで動く）
export async function clientAction() {
    // ログイン処理（今回はダミー）
    localStorage.setItem("userId", "dummy-user-123");

    return redirect("/top");
}

export default function Login() {
    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
            <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>
                    ログイン
                </button>
            </Form>
        </div>
    );
}