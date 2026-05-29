type FilterChipProps = {
    id: string;
    name: string;
    isSelected: boolean;
    onToggle: (id: string) => void;
    className?: string;
};

export default function FilterChip({ id, name, isSelected, onToggle, className = "" }: FilterChipProps) {
    return (
        <div
            onClick={() => onToggle(id)}
            className={`transition-all border rounded-[var(--spacing-16)] flex justify-center items-center cursor-pointer px-[var(--spacing-16)] 
                ${isSelected
                    ? "shadow-[var(--box-shadow)] border-transparent text-white"
                    : "border-[var(--light-gray)] bg-white text-gray-700 hover:bg-[var(--hover-color)]"
                } ${className}`}
        >
            <p>{name}</p>
        </div>
    );
}