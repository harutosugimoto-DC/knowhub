type StatusChipProps = {
    name: string; 
};

export default function StatusChip({ name }: StatusChipProps) {
    
    const statusStyles: Record<string, string> = {
        "回答募集中": "bg-[var(--status-color-taking)]",
        "整理中":     "bg-[var(--status-color-organize)]",
        "解決済み":   "bg-[var(--status-color-resolved)]",
    };

    const bgClass = statusStyles[name] || "bg-gray-400";

    return (
        <div className={`${bgClass} rounded-[var(--radius-big)] inline-flex items-center justify-center text-white px-[var(--spacing-16)] py-[var(--spacing-12)]`}>
            <div className="flex items-center h-[12px]">{name}</div>
        </div>
    );
}