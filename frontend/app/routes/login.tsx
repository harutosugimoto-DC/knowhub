// app/routes/login.tsx
import { Form } from "react-router";

export default function Login() {
    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
            <h1>ログイン</h1>
            <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="email"
                    name="email"
                    placeholder="メールアドレス"
                    required
                    style={{ padding: "0.5rem" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="パスワード"
                    required
                    style={{ padding: "0.5rem" }}
                />
                <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>
                    ログイン
                </button>
            </Form>
        </div>
    );
}