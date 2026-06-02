// app/components/common/DropdownMenu.tsx

import { useState, useRef, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

const DropdownMenu = ({ options, value, onChange }: Props) => {

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 選択中のラベルをトリガーに表示するために取得
  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? '';

  // ===== 表示する選択肢を絞り込む =====
  // 現在選択中の項目はトリガーに表示済みのため、ドロップダウンから除外する
  // 例：「投稿日昇順」選択中 → ドロップダウンには残り3つのみ表示
  const unselectedOptions = options.filter((opt) => opt.value !== value);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 選択肢クリック時：親に値を渡してドロップダウンを閉じる
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">

      {/* ===== トリガーボタン =====
          ・w-[168px] h-[40px]：仕様通りのサイズ
          ・選択中のラベルを表示
          ・開閉でアイコン切り替え
      */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          transition-all hover:bg-[var(--hover-color)]
          cursor-pointer
          flex items-center justify-between
          w-[168px] h-[40px]
          border border-[var(--light-gray)]
          bg-white
          px-3
          text-base leading-[1.6] text-[var(--text-color-black)]
          rounded-[var(--radius-small)]
        "
      >
        <span>{selectedLabel}</span>
        {isOpen
          ? <KeyboardArrowUpIcon fontSize="small" />
          : <KeyboardArrowDownIcon fontSize="small" />
        }
      </button>

      {/* ===== ドロップダウンリスト =====
          ・選択済みを除いた3つのみ表示（3 × 40px = 120px）
          ・トリガー40px + リスト120px = 合計160px
      */}
      {isOpen && (
        <ul
          className="
            absolute right-0 top-full
            z-50
            w-[168px]
            bg-white
            border border-[var(--light-gray)]
            shadow-[var(--box-shadow)]
            rounded-[var(--radius-small)]
            overflow-hidden
          "
        >
          {unselectedOptions.map((option) => (
            <li key={option.value}>
              {/* h-[40px]：1選択肢あたり40px */}
              <button
                onClick={() => handleSelect(option.value)}
                className="
                transition-all hover:bg-[var(--hover-color)]
                  cursor-pointer
                  w-full h-[40px]
                  flex items-center
                  px-3
                  text-base leading-[1.6] text-[var(--text-color-black)]
                "
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;