import { useState } from "react";
import Card from "../common/Card";
import Bookmark from "../common/Bookmark";
import Like from "../common/Like";
import Comment from "../common/Comment";
import TagChip from "../common/TagChip";
import StatusChip from "../common/StatusChip";
import CardActionMenu from "../common/CardActionMenu";
// 新しく切り出したコンポーネントをインポート
import CollapsibleContent from "../common/CollapsibleContent";

import { type QuestionType } from "@/types/question.ts";

type QuestionDetailCardProps = {
    question: QuestionType & { content?: string };
    onDelete?: () => void;
}

export default function QuestionDetailCard({ question, onDelete }: QuestionDetailCardProps) {
    const {
        id,
        title,
        statusId,
        isLiked = false,
        isBookmarked = false,
        userName,
        postingTime,
        likeCount,
        bookmarkCount,
        replyCount,
        tagNames,
        content = "",
    } = question;

    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const handleRemove = () => {
        onDelete?.();
    }

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between py-[var(--spacing-16)]">
                <div className="flex items-center gap-4">
                    <StatusChip name={statusId} />
                    <h2 className="text-[length:var(--font-size-big)]">
                        {title}
                    </h2>
                </div>

                <CardActionMenu
                    isContentOpen={isContentOpen}
                    setIsContentOpen={setIsContentOpen}
                    onRemove={handleRemove}
                    isOverflowing={isOverflowing}
                />
            </div>

            {/* 中央：質問本文 */}
            <CollapsibleContent
                content={content}
                isContentOpen={isContentOpen}
                setIsContentOpen={setIsContentOpen}
                setIsOverflowing={setIsOverflowing}
            />

            {/* 下部：タグリスト、各種アクション */}
            <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {tagNames?.map((tag, index) => (
                        <TagChip key={index} text={tag} />
                    ))}
                </div>

                <div className="flex items-center gap-2 ">
                    <Bookmark id={id} isBookmarked={isBookmarked} count={bookmarkCount} />
                    <Like id={id} type="question" isLiked={isLiked} count={likeCount} />
                    <Comment count={replyCount} />
                </div>
            </div>
        </Card>
    );
}
