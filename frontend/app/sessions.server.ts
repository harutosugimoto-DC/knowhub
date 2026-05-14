// app/sessions.server.ts
import { createCookieSessionStorage } from "react-router";

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session", // Cookieの名前
        httpOnly: true,    // JavaScriptからのアクセスを禁止（セキュリティ対策）
        path: "/",         // サイト全体で有効
        sameSite: "lax",
        secrets: ["super-secret-key"], // ※本番環境では環境変数にしてください
        secure: process.env.NODE_ENV === "production", // 本番環境ではhttps必須
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;