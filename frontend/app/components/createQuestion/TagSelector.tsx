import { useState } from "react";
// 先ほど作成されたTagChipをインポートします（パスは環境に合わせて調整してください）
import TagChip from "@/components/common/TagChip";

type TagSelectorProps = {
    id: number;
};

// 画像に表示されているタグのモックデータ（一覧）
const AVAILABLE_TAGS = [
    "Python", "Javascript", "Github", "Figma", "Java", "Ruby",
    "セキュリティ", "人事", "経費精算", "Claude.ai", "C", "勤怠管理",
    "開発環境", "リモートワーク"
];

export default function TagSelector({ id }: TagSelectorProps) {
    // 選択されたタグを管理するステート（初期値として3つ入れておきます）
    const [selectedTags, setSelectedTags] = useState<string[]>(["Python", "Javascript", "Github"]);

    // 下のリストからタグをクリックした時の処理（追加）
    const handleSelect = (tag: string) => {
        // まだ選択されていなければ追加する
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        else{
            handleRemove(tag);
        }
    };

    const handleRemove = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="border border-[var(--light-gray)] rounded-[var(--radius-small)] bg-white w-full">

            {/* 上部：選択済みのタグを表示するエリア */}
            <div className={`p-[var(--spacing-8)] flex flex-wrap gap-[var(--spacing-8)] ${selectedTags.length === 0 ? 'h-[48px] items-center' : ''}`}>
                {selectedTags.map(tag => (
                    <TagChip
                        key={tag}
                        text={tag}
                        isButton={true}
                        onClick={() => handleRemove(tag)}
                    />
                ))}
                {
                    selectedTags.length === 0 && (
                        <p className="text-[var(--dark-gray)] ">選択されたタグがここに追加されます</p>
                    )
                }
            </div>

            {/* 境界線 */}
            <hr className="border-t border-[var(--light-gray)] m-0" />

            {/* 下部：選択可能なタグの一覧エリア */}
            <div className="p-[var(--spacing-16)] flex flex-wrap gap-x-[var(--spacing-8)] gap-y-[var(--spacing-12)]">
                {AVAILABLE_TAGS.map(tag => {
                    // このタグが現在選択されているかどうかを判定
                    const isSelected = selectedTags.includes(tag);

                    return (
                        <button
                            key={tag}
                            onClick={() => handleSelect(tag)}
                            className={`
                                cursor-pointer
                                rounded-[var(--radius-big)] px-[var(--spacing-16)] py-[var(--spacing-8)] 
                                font-['Lora'] text-[var(--font-size-normal)] transition-all duration-200
                                ${isSelected
                                    // 選択中：緑背景、白文字、影あり
                                    ? "bg-[var(--main-color)] text-white shadow-[var(--box-shadow)] border border-transparent"
                                    // 未選択：白背景、グレー枠線、グレー文字
                                    : "bg-white !text-[var(--dark-gray)] border border-[var(--dark-gray)]"
                                }
                            `}
                        >
                            <p className="flex items-center h-[var(--spacing-12)]">{tag}</p>
                        </button>
                    );
                })}
            </div>

        </div>
    );
}