// app/routes/login.tsx
import { redirect, useNavigate } from "react-router";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// 取得したクライアントIDをここに入れます
// ※ 本番環境では環境変数（VITE_GOOGLE_CLIENT_IDなど）から読み込むようにしてください
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";

// 【Loader】ページ表示前に実行される（ブラウザで動く）
export async function clientLoader() {
    const userId = localStorage.getItem("userId");

    // すでにログイン済みならトップへリダイレクト
    if (userId) {
        return redirect("/top");
    }
    return null;
}

export default function Login() {
    // リダイレクト用に useNavigate を使用します
    const navigate = useNavigate();

    // ログイン成功時の処理
    const handleLoginSuccess = (credentialResponse: any) => {
        if (credentialResponse.credential) {
            // JWTをデコードしてユーザー情報（名前、メール、IDなど）を取り出す
            const decodedInfo = jwtDecode(credentialResponse.credential) as any;
            console.log("Logged in as:", decodedInfo.name);

            // localStorage にユーザーのID（sub）を保存
            localStorage.setItem("userId", decodedInfo.sub);

            // トップページへ遷移
            navigate("/top");
        }
    };

    // ログイン失敗時の処理
    const handleLoginError = () => {
        console.error("Googleログインに失敗しました");
    };

    return (
        // Provider でラップしてクライアントIDを渡します
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>ログイン</h2>
                
                {/* Googleが提供する公式のログインボタン */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                        theme="outline" // ダークテーマにする場合
                        text="signin_with" // ボタンのテキスト指定
                    />
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}