import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import TextInput from "../components/common/TextInput";
import Button from "../components/common/Button";
import ErrorMessages from "../components/common/ErrorMessages";
import { authService } from "@/api/authService";
import { useUser } from "@/contexts/UserContext";

const MAX_NICKNAME_LENGTH = 10;

export default function Nickname() {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { user, setUser } = useUser()
    useEffect(() => {
        if (user && user.nickname) {
            // `{ replace: true }` をれることで、戻るボタンを押したときの無限ループを防ぎます
            navigate("/top", { replace: true });
        }
    }, [user, navigate]);

    const validate = (): string => {
        if (nickname.trim().length === 0) {
            return "ニックネームを入力してください。";
        }
        if (nickname.length > MAX_NICKNAME_LENGTH) {
            return `文字数が制限を超えています。${MAX_NICKNAME_LENGTH}文字以内で入力してください。`;
        }
        return "";
    };

    const handleSubmit = async () => {
        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            await authService.updateNickname(nickname);
            setUser(prev => prev ? { ...prev, nickname } : null);
            navigate("/top");
        } catch (err: any) {
            setError(err.response?.data?.error || "ニックネームの登録に失敗しました。");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-[var(--base-color)] p-[var(--spacing-16)]">
            <main className="w-full flex justify-center">
                <div className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)] px-[var(--spacing-32)] py-[var(--spacing-64)] w-[450px] flex flex-col items-center gap-[var(--spacing-24)]">
                    <h1 className="text-[length:var(--font-size-big)] font-normal text-[var(--text-color-black)] text-center">
                        ニックネームを入力してください
                    </h1>
                    <div className="w-[420px] flex flex-col gap-[var(--spacing-8)]">
                        <TextInput placeholder="ニックネーム" value={nickname} onChange={setNickname} />

                        <ErrorMessages message={error} />

                    </div>
                    <Button
                        text={isLoading ? "処理中..." : "次に進む"}
                        onClick={handleSubmit}
                        className="w-[420px] h-[50px]"

                    />
                </div>
            </main>
        </div>
    );
}