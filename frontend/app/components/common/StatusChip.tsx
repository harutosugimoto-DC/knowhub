


type StatusChipProps = {
    id: number;
};
export default function StatusChip({ id }: StatusChipProps) {
    return (
        <div className={` ${id === 1 ? "bg-[var(--status-color-taking)]" : id === 2 ? "bg-[var(--status-color-organize)]" : "bg-[var(--status-color-resolved)]"} rounded-[var(--radius-big)] inline-flex items-center justify-center text-white px-[var(--spacing-16)] py-[var(--spacing-12)]`} >
            <div className="flex items-center h-[12px]">{id === 1 ? "回答募集中" : id === 2 ? "整理中" : "解決済み"}</div>
        </div>
    );
}