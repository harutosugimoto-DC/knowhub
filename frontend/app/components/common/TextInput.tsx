import SearchIcon from '@mui/icons-material/Search';

type TextInputProps = {
    placeholder: string;
    isSearch?: boolean;
    onSearch?: () => void;
    value: string;
    onChange: (text: string) => void;
};

export default function TextInput({ placeholder, isSearch, onSearch, value, onChange }: TextInputProps) {
    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    w-full bg-white 
                    border border-[var(--light-gray)] rounded-[var(--radius-small)] 
                    px-[var(--spacing-16)] py-[var(--spacing-8)] 
                    text-[var(--text-color-black)] 
                    placeholder:text-[var(--dark-gray)] 
                    focus:outline-none focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)] 
                    transition-all duration-200
                `}
            />

            {isSearch && (
                <button
                    type="button"
                    onClick={() => {
                        if (value !== "") {
                            onSearch?.();
                        }
                    }}
                    className={`
                        absolute right-[var(--spacing-16)] top-1/2 -translate-y-1/2 
                        w-[24px] h-[24px] bg-[var(--main-color)] rounded-full 
                        flex items-center justify-center text-white 
                        hover:opacity-80 transition-opacity
                    `}
                >
                    <SearchIcon className="!text-[16px]" />
                </button>
            )}
        </div>
    );
}