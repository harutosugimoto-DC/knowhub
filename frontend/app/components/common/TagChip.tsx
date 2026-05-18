
import CloseIcon from '@mui/icons-material/Close';

type TagChipProps = {
    text: string;
    isButton?: boolean;
    onClick?: () => void;
};
export default function TagChip({ text, isButton, onClick }: TagChipProps) {
    return (
        <div className={`rounded-[var(--radius-big)] px-[var(--spacing-16)] py-[var(--spacing-8)] bg-white inline-flex items-center border border-[var(--accent-color)] gap-[var(--spacing-4)] ${isButton ? "h-[32px]" : ""} `} >
            <p className="flex items-center font-['Lora'] text-[var(--accent-color)] h-[var(--spacing-12)]">{text}</p>
            {isButton && (
                <CloseIcon className='flex items-center cursor-pointer !text-[16px] text-[var(--light-gray)] ' onClick={onClick} />
            )}
        </div>
    );
}