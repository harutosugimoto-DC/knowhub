type ButtonProps = {
    text: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean; 
};

export default function Button({ text, onClick, className, disabled = false }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`
                transition-all duration-200 inline-block px-[var(--spacing-128)] py-[var(--spacing-16)] rounded-[var(--radius-small)] text-white select-none
                
                ${disabled
                    ? /* 💡 ④ disabled が true の時のスタイル（グレーアウト・禁止マーク） */
                    "bg-[var(--light-gray)] cursor-not-allowed opacity-70"

                    : /* 💡 ⑤ disabled が false の時のスタイル（グラデーション・ホバー・沈むエフェクト） */
                    "bg-[image:var(--gradation-green)] cursor-pointer shadow-[var(--box-shadow)] hover:shadow-[var(--hover-box-shadow)] active:shadow-[var(--active-box-shadow)] hover:translate-y-[1px] active:translate-y-[2px]"
                }
                ${className || ''}
            `}
        >
            {text}
        </button>
    );
}