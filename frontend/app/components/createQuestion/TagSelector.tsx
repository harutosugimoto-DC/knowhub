import TagChip from "@/components/common/TagChip";
import { tagPlaceholder } from "@/constants/placeholder";
type TagSelectorProps = {
    selectedTagIds: string[];
    setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
    allTagData: { id: string, name: string }[];
    setErrors: React.Dispatch<React.SetStateAction<{ title?: string; detail?: string; tags?: string }>>;
};

export default function TagSelector({ selectedTagIds, setSelectedTagIds, allTagData, setErrors }: TagSelectorProps) {

    // タグの選択・解除をこれ1つで制御（トグル処理）
    const handleToggleSelect = (tagId: string) => {
        setSelectedTagIds((prev) => {
            const isSelected = prev.includes(tagId);
            if (!isSelected && prev.length >= 5) {
                setErrors((current) => ({
                    ...current,
                    tags: "タグは最大5つまでしか選択できません。"
                }));
                return prev;
            }
            setErrors((current) => ({
                ...current,
                tags: undefined
            }));

            return isSelected 
                ? prev.filter((id) => id !== tagId) 
                : [...prev, tagId];
        });
    };

    return (
        <div className="border border-[var(--light-gray)] rounded-[var(--radius-small)] bg-white w-full">

            {/* 上部：選択済みのタグを表示するエリア */}
            <div className={`p-[var(--spacing-8)] flex flex-wrap gap-[var(--spacing-8)] ${selectedTagIds.length === 0 ? 'h-[43px] items-center' : ''}`}>
                {selectedTagIds.map(tagId => {
                    const currentTag = allTagData.find(tag => tag.id === tagId);
                    return (
                        <TagChip
                            key={tagId}
                            text={currentTag?.name || ""}
                            isButton={true}
                            onClick={() => handleToggleSelect(tagId)}
                        />
                    );
                })}
                {selectedTagIds.length === 0 && (
                    <p className="cursor-default text-[var(--dark-gray)]">{tagPlaceholder}</p>
                )}
            </div>

            {/* 境界線 */}
            <hr className="border-t border-[var(--light-gray)] m-0" />

            {/* 下部：選択可能なタグの一覧エリア */}
            <div className="p-[var(--spacing-16)] flex flex-wrap gap-x-[var(--spacing-8)] gap-y-[var(--spacing-12)]">
                {allTagData.map(tag => {
                    const isSelected = selectedTagIds.includes(tag.id);

                    return (
                        <button
                            key={tag.id}
                            onClick={() => handleToggleSelect(tag.id)}
                            className={`
                                cursor-pointer
                                rounded-[var(--radius-big)] px-[var(--spacing-16)] py-[var(--spacing-8)] 
                                font-['Lora'] text-[var(--font-size-normal)] transition-all
                                ${isSelected
                                    ? "bg-[var(--main-color)] text-white shadow-[var(--box-shadow)] border border-transparent"
                                    : "bg-white !text-[var(--dark-gray)] border border-[var(--dark-gray)] hover:bg-[var(--hover-color)]"
                                }
                            `}
                        >
                            <span className="flex items-center h-[var(--spacing-12)]">{tag.name}</span>
                        </button>
                    );
                })}
            </div>

        </div>
    );
}