import Card from "./Card";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from "react";

type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
    confirmOnClose?: boolean;
    confirmCloseMessage?: string;
}

export default function Modal({ children, onClose, confirmOnClose = false, confirmCloseMessage }: ModalProps) {
    
    useEffect(() => {
        // 開いた時の元のスタイルを記憶しておく
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        // 背景のスクロールを完全に禁止にする
        document.body.style.overflow = "hidden";

        // モーダルが閉じた時（アンマウント時）に、スクロールを元の状態に戻す
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleClose = () => {
        if (confirmOnClose) {
            if (!confirm(confirmCloseMessage ?? "本当に閉じますか？")) {
                return;
            }
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center z-[var(--z-modal)]">

            <div className="absolute inset-0 bg-[var(--light-gray)] opacity-50" onClick={() => handleClose()}></div>

            <Card className="!bg-[var(--base-color)] z-[2] relative !p-[var(--spacing-32)] gap-[var(--spacing-32)] flex flex-col justify-center items-center w-[750px] max-w-[90vw]">
                <button className="bg-[var(--danger-color)] text-white rounded-full w-[50px] h-[50px] absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer" onClick={() => handleClose()}>
                    <CloseIcon />
                </button>
                {children}
            </Card>

        </div>
    )
}