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
}

export default function QuestionDetailCard({ question }: QuestionDetailCardProps) {
    const {
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
        content = "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
    } = question;

    // 開閉状態を管理するState（メニューと本文の両方に渡す）
    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    
    const handleRemove = () => {
        // 削除処理の実装
        console.log("削除ボタンが押されました");
    }

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between py-[var(--spacing-16)]">
                <div className="flex items-center gap-4">
                    <StatusChip id={statusId} />
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
                    <Bookmark isBookmarked={isBookmarked} count={bookmarkCount} />
                    <Like isLiked={isLiked} count={likeCount} />
                    <Comment count={replyCount} />
                </div>
            </div>
        </Card>
    );
}