import Card from "./Card";

import CloseIcon from '@mui/icons-material/Close';

type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
    const handleClose = () => {
        if (confirm("本当に閉じますか？")) {
            onClose();
        }
    }
    return (
        <div className="fixed inset-0 flex justify-center items-center z-[var(--z-modal)]">

            <div className="absolute inset-0 bg-[var(--light-gray)] opacity-50" onClick={() => handleClose()}></div>

            <Card className="!bg-[var(--base-color)] z-[2] relative !p-[var(--spacing-32)] gap-[var(--spacing-32)] flex flex-col justify-center items-center">
                <button className="bg-[var(--danger-color)] text-white rounded-full w-[50px] h-[50px] absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer" onClick={() => handleClose()}>
                    <CloseIcon />
                </button>
                {children}
            </Card>

        </div>
    )
}