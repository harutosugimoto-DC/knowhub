type TextAreaProps = {
    placeholder: string;
    value: string;
    onChange: (text: string) => void;
    rows?: number; // 初期状態で何行分の高さにするか（指定がなければデフォルト6行）
};

export default function TextArea({ placeholder, value, onChange, rows = 6 }: TextAreaProps) {
    return (
        <textarea
            placeholder={placeholder}
            value={value}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
            className={`
                max-h-[256px]
                w-full bg-white 
                border border-[var(--light-gray)] rounded-[var(--radius-small)] 
                px-[var(--spacing-16)] py-[var(--spacing-8)] 
                text-[var(--text-color-black)] 
                placeholder:text-[var(--dark-gray)] 
                focus:outline-none focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)] 
                transition-all duration-200
                resize-y /* ユーザーが右下をドラッグして縦方向に高さを広げられるようにする */
            `}
        />
    );
}