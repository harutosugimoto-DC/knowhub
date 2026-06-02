import { useState } from "react";
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { FaTrashAlt } from "react-icons/fa";

type CardActionMenuProps = {
    isContentOpen: boolean;
    setIsContentOpen: (isOpen: boolean) => void;
    onRemove: () => void;
    isOverflowing: boolean;
};

export default function CardActionMenu({
    isContentOpen,
    setIsContentOpen,
    onRemove,
    isOverflowing
}: CardActionMenuProps) {
    // ドロップダウンの開閉状態は、このコンポーネント内に閉じた状態(Local State)として管理します
    const [isDropDownOpen, setIsDropdownOpen] = useState(false);

    // 削除処理のハンドラー
    const handleRemoveClick = () => {
        onRemove(); // 親から渡された削除処理を実行
        setIsDropdownOpen(false); // メニューを閉じる
    };

    return (
        <div className="flex items-center text-[var(--dark-gray)] gap-4">
            {/* メニュー（3点リーダー） */}
            <div className="relative">
                <MoreVertOutlinedIcon
                    className="cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropDownOpen)}
                />

                {isDropDownOpen && (
                    <div
                        className="transition-all hover:bg-[var(--hover-color)] cursor-pointer flex items-center justify-center bg-white rounded-[var(--spacing-4)] absolute left-[100%] translate-x-[-100%] shadow-[var(--box-shadow)] border border-[var(--light-gray)] w-[128px] h-[40px] z-10"
                        // onClick={handleRemove()} だとレンダリング時に即時実行されてしまうため、関数を渡す形に修正
                        onClick={handleRemoveClick}
                    >
                        <button className="flex items-center justify-center gap-4 text-[var(--danger-color)] pointer-events-none">
                            <FaTrashAlt />
                            <p>削除</p>
                        </button>
                    </div>
                )}
            </div>

            {/* 開閉トグル（矢印アイコン） */}
            {isOverflowing && (
                isContentOpen ? (
                    <KeyboardArrowUpOutlinedIcon
                        className="cursor-pointer"
                        onClick={() => setIsContentOpen(false)}
                    />
                ) : (
                    <KeyboardArrowDownOutlinedIcon
                        className="cursor-pointer"
                        onClick={() => setIsContentOpen(true)}
                    />
                )
            )}

        </div>
    );
}