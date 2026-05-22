// ─────────────────────────────────────────────────────────────
// 初期設定画面（ニックネーム登録）
// ・新規ユーザーがログイン後に最初に表示される画面
// ・ニックネームを入力して「次に進む」でプロフィールを登録する
// ・API送信は認証フェーズで PUT /api/profile として実装予定
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

// 既存の共通コンポーネントをimport
import TextInput from "../components/common/TextInput";
import Button from "../components/common/Button";
import ErrorMessages from "../components/common/ErrorMessages";

// ─────────────────────────────────────────────────────────────
// 定数定義
// コード内に直接数値を書くと後から変更しにくいため定数として定義する
// ─────────────────────────────────────────────────────────────
const MAX_NICKNAME_LENGTH = 10; // ニックネームの最大文字数

export default function Nickname() {

    // ─────────────────────────────────────────────────────────
    // state定義
    // nickname  ：TextInputの入力値を管理する
    // errors    ：バリデーションエラーのメッセージ一覧を管理する
    //             → 空配列ならErrorMessagesは非表示になる（コンポーネント仕様）
    // isLoading ：送信中の連打防止用フラグ
    //             → 認証フェーズでAPI送信時に活用予定
    // ─────────────────────────────────────────────────────────
    const [nickname, setNickname] = useState<string>("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ─────────────────────────────────────────────────────────
    // 【validate】バリデーション処理
    // ・入力値をチェックしてエラーメッセージの配列を返す
    // ・エラーがなければ空配列を返す
    // ・なぜ関数に切り出すか：handleSubmit内をシンプルに保つため
    // ─────────────────────────────────────────────────────────
    const validate = (): string[] => {
        const newErrors: string[] = [];

        // 未入力チェック：空文字ならエラーを追加する
        if (nickname.trim().length === 0) {
            newErrors.push("ニックネームを入力してください。");
        }

        // 文字数チェック：最大文字数を超えていたらエラーを追加する
        if (nickname.length > MAX_NICKNAME_LENGTH) {
            newErrors.push(`文字数が制限を超えています。${MAX_NICKNAME_LENGTH}文字以内で入力してください。`);
        }

        return newErrors;
    };

    // ─────────────────────────────────────────────────────────
    // 【handleSubmit】「次に進む」ボタン押下時の処理
    // ─────────────────────────────────────────────────────────
    const handleSubmit = () => {

        // バリデーション実行：エラーがあれば画面に表示して処理を止める
        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return; // エラーがある場合はここで処理を終了する
        }

        // バリデーション通過：エラーをクリアして送信処理へ進む
        setErrors([]);
        setIsLoading(true);

        // TODO: 認証フェーズで以下に置き換える
        // ─────────────────────────────────────────────────────
        // const { data: { session } } = await supabase.auth.getSession();
        // await fetch("/api/profile", {
        //     method: "PUT",
        //     headers: {
        //         "Authorization": `Bearer ${session?.access_token}`,
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ profile_name: nickname }),
        // });
        // navigate("/top");
        // ─────────────────────────────────────────────────────
    };

    return (
        // ─────────────────────────────────────────────────────
        // ページ全体のラッパー
        // login.tsxと同じレイアウト構造を使用する
        // ─────────────────────────────────────────────────────
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-[var(--base-color)] p-[var(--spacing-16)]">
            <main className="w-full flex justify-center">

                {/* ── カード本体 ── */}
                <div className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)]
                 px-[var(--spacing-32)] py-[var(--spacing-64)] w-[450px] flex flex-col items-center gap-[var(--spacing-24)]">
                    {/* ── タイトル ── */}
                    <h1 className="text-[length:var(--font-size-big)] font-normal text-[var(--text-color-black)] text-center">
                        ニックネームを入力してください
                    </h1>

                    {/* ── 入力エリア（TextInput + ErrorMessages） ── */}
                    {/* w-fullで横幅いっぱいに広げる */}
                    <div className="w-[420px] flex flex-col gap-[var(--spacing-8)]">

                        {/* ニックネーム入力欄 */}
                        {/* onChangeにsetNicknameを直接渡せるのは */}
                        {/* TextInputのonChangeが (text: string) => void 型のため */}
                        <TextInput
                            placeholder="ニックネーム"
                            value={nickname}
                            onChange={setNickname}
                        />

                        {/* エラーメッセージ一覧 */}
                        {/* errorsが空配列のときはErrorMessages内部で非表示になる */}
                        <ErrorMessages messages={errors} />

                    </div>

                    {/* ── 次に進むボタン ── */}
                    <Button
                        text="次に進む"
                        onClick={handleSubmit}
                        className="w-[420px] h-[50px]"
                    />

                </div>
            </main>
        </div>
    );
}