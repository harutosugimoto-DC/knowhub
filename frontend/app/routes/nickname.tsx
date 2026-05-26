import { useState } from "react";
import { useNavigate } from "react-router";
import TextInput from "../components/common/TextInput";
import Button from "../components/common/Button";
import ErrorMessages from "../components/common/ErrorMessages";
import { authService } from "@/api/authService";

const MAX_NICKNAME_LENGTH = 10;

export default function Nickname() {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string>("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const validate = (): string[] => {
        const newErrors: string[] = [];
        if (nickname.trim().length === 0) newErrors.push("ニックネームを入力してください。");
        if (nickname.length > MAX_NICKNAME_LENGTH) {
            newErrors.push(`文字数が制限を超えています。${MAX_NICKNAME_LENGTH}文字以内で入力してください。`);
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setIsLoading(true);

        try {
            await authService.updateNickname(nickname);
            navigate("/top");
        } catch (err: any) {
            setErrors([err.response?.data?.error || "ニックネームの登録に失敗しました。"]);
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
                        <ErrorMessages messages={errors} />
                    </div>
                    <Button text="次に進む" onClick={handleSubmit} className="w-[420px] h-[50px]" />
                </div>
            </main>
        </div>
    );
}