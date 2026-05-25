


type FilterChipProps = {
    name: string;
    id: number;
    setOnClick: React.Dispatch<React.SetStateAction<number[]>>;
    isSelected: boolean;
    className?: string;
};
export default function FilterChip({ name, id, setOnClick, isSelected, className }: FilterChipProps) {
    return (
        <div onClick={() => setOnClick((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )} className={`transition-all ${isSelected ? "shadow-[var(--box-shadow)] border-[transparent] text-white" : "border-[var(--light-gray)] !bg-white"} border rounded-[var(--spacing-16)] flex justify-center items-center cursor-pointer px-[var(--spacing-16)] ${className ? className : ""}`} >
            <p>{name}</p>
        </div>
    );
}