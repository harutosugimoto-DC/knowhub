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
        <div className="flex items-center justify-center gap-[var(--spacing-16)] p-[var(--spacing-8)] select-none">
            
            {/* ─── ◀ 左の戻るボタン ─── */}
            <button
                disabled={current === 1}
                onClick={() => onPageChange(Math.max(current - 1, 1))}
                className={`
                    flex items-center justify-center w-[44px] h-[44px] border rounded-full transition-all duration-200
                    ${current === 1
                        ? "text-[var(--light-gray)] border-[var(--light-gray)] cursor-auto bg-transparent"
                        : "text-[var(--main-color)] border-[var(--main-color)] cursor-pointer hover:text-white hover:border-white hover:bg-[var(--main-color)]"
                    }
                `}
            >
                <KeyboardArrowLeftOutlinedIcon className="!text-[32px] pointer-events-none" />
            </button>

            {/* ─── 🔢 ページ数字エリア ─── */}
            <div className="flex items-center gap-1">
                {pages.map((page, index) => {
                    // 三点リーダー '...' の場合は、ボタンではなくただのテキスト(span)として描画する
                    if (typeof page !== 'number') {
                        return (
                            <span 
                                key={index} 
                                className="w-[44px] h-[44px] flex items-center justify-center text-[var(--dark-gray)] font-bold"
                            >
                                {page}
                            </span>
                        );
                    }

                    // 通常の数字ボタン
                    const isActive = page === current;
                    return (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`
                                w-[44px] h-[44px] flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                                ${isActive
                                    ? "bg-[var(--main-color)] text-white font-bold shadow-sm"
                                    : "text-[var(--text-color-black)] hover:bg-[var(--hover-color)] hover:text-[var(--main-color)]"
                                }
                            `}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* ─── ▶ 右の進むボタン ─── */}
            <button
                disabled={current === max}
                onClick={() => onPageChange(Math.min(current + 1, max))}
                className={`
                    flex items-center justify-center w-[44px] h-[44px] border rounded-full transition-all duration-200
                    ${current === max
                        ? "text-[var(--light-gray)] border-[var(--light-gray)] cursor-auto bg-transparent"
                        : "text-[var(--main-color)] border-[var(--main-color)] cursor-pointer hover:text-white hover:border-white hover:bg-[var(--main-color)]"
                    }
                `}
            >
                <KeyboardArrowRightOutlinedIcon className="!text-[32px] pointer-events-none" />
            </button>

        </div>
    );
}