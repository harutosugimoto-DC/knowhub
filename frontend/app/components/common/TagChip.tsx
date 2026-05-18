


type TagChipProps = {
    text: string;
};
export default function TagChip({ text }: TagChipProps) {
    return (
        <div className="rounded-[var(--radius-big)] px-[var(--spacing-16)] py-[var(--spacing-8)] bg-white inline-flex border border-[var(--accent-color)]" >
            <p className="flex items-center font-['Lora'] text-[var(--accent-color)] h-[var(--spacing-12)]">{text}</p>
        </div>
    );
}