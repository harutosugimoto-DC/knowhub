type ProgressBarProps = {
    percentage: number;
};

export default function ProgressBar({ percentage }: ProgressBarProps) {
    return (
        <div className="w-full h-[4px] bg-[var(--light-gray)] rounded-full overflow-hidden">

            <div
                className="h-full bg-[var(--main-color)] rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}