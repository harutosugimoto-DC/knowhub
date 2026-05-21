import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
type ToastProps = {
    status: boolean; // true: 成功（緑） / false: 失敗（赤）
    name: string;    // 表示するメッセージテキスト
};

export default function Toast({ status, name }: ToastProps) {
    const themeClass = status
        ? "bg-[#D4FFE7] border-[var(--main-color)] text-[var(--main-color)]"
        : "bg-[#FFD4D4] border-[var(--danger-color)] text-[var(--danger-color)]";

    return (
        <div className={`text-[16px] flex items-center gap-[var(--spacing-8)] px-[var(--spacing-16)] py-[var(--spacing-8)] border-2 rounded-[var(--radius-small)] w-fit ${themeClass}`} >
            <div className="flex-shrink-0 flex items-center justify-center">
                {status ? (
                    <CheckCircleOutlinedIcon className='!text-[16px]' />
                ) : (
                    <CancelOutlinedIcon className='!text-[16px]' />
                )}
            </div>

            <p>{name}</p>

        </div>
    );
}