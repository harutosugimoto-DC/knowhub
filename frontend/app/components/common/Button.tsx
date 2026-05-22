
type ButtonProps = {
    text: string;
    onClick: () => void;
    className?: string; // 追加のクラス名を受け取るためのオプションのプロパティ
};

export default function Button({ text, onClick, className }: ButtonProps) {

    return (
        <button 
        onClick={()=>onClick()}
        className={`shadow-[var(--box-shadow)] inline-block px-[var(--spacing-128)] py-[var(--spacing-16)] 
        bg-[image:var(--gradation-green)] text-white rounded-[var(--radius-small)] cursor-pointer ${className || ''}`}>
            {text}
        </button>
    );
}