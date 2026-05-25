import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';

type PaginationProps = {
    max: number;
    current: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({ max, current, onPageChange }: PaginationProps) {
    if (max < 1) return null;

    const pages = (() => {
        if (max <= 5) {
            return Array.from({ length: max }, (_, i) => i + 1);
        }
        if (current <= 3) {
            return [1, 2, 3, 4, 5, '...', max];
        }
        if (current >= max - 2) {
            return [1, '...', max - 4, max - 3, max - 2, max - 1, max];
        }
        return [1, '...', current - 2, current - 1, current, current + 1, current + 2, '...', max];
    })();

    return (
        <div className="flex items-center justify-center gap-[var(--spacing-32)] p-[var(--spacing-8)]">
            <div className='w-[50px] h-[50px] p-[4px] '>
                <KeyboardArrowLeftOutlinedIcon className={`${current === 1 ? "!text-[var(--light-gray)] !border-[var(--light-gray)] !cursor-auto" : ""} cursor-pointer !text-[42px] text-[var(--main-color)] border border-[var(--main-color)] rounded-full`} />
            </div>
            <div className='flex'>
                {pages.map((page, index) => (
                    <button
                        key={index}
                        className={`${typeof page === 'number' ? 'cursor-pointer' : ''} w-[50px] h-[50px] flex items-center justify-center rounded-full ${page === current
                            ? "bg-[var(--main-color)] text-white"
                            : ""
                            }`}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <div className='w-[50px] h-[50px] p-[4px]'>
                <KeyboardArrowRightOutlinedIcon className={`${current === max ? "!text-[var(--light-gray)] !border-[var(--light-gray)] !cursor-auto" : ""}cursor-pointer !text-[42px] text-[var(--main-color)] border border-[var(--main-color)] rounded-full`} />
            </div>
        </div>
    );
}