import AccessTimeIcon from '@mui/icons-material/AccessTime';

type TimeProps = {
    postingTime: string;
};

const getTimeAgo = (date: Date) => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffHours < 1) return "たった今";
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;
    if (diffMonths > 0) return `${diffMonths}ヶ月前`;
    if (diffYears > 0) return `${diffYears}年前`;
    return "不明な時間";
};
export default function Time({ postingTime }: TimeProps) {
    const date = new Date(postingTime);
    return (
        <div className="flex items-center gap-[var(--spacing-4)] text-[var(--dark-gray)]">
            <AccessTimeIcon className="!text-[var(--font-size-normal)]" />
            <span>{getTimeAgo(date)}</span>
        </div>
    );
}