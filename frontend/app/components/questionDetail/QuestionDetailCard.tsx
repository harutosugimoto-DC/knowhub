import Card from "../common/Card";
import Bookmark from "../common/Bookmark";
import Like from "../common/Like";
import Comment from "../common/Comment";
import TagChip from "../common/TagChip";
import StatusChip from "../common/StatusChip";
// 切り出したコンポーネントをインポート
import CardActionMenu from "../common/CardActionMenu"; 

import { type QuestionType } from "@/types/question.ts";
import { useEffect, useRef, useState } from "react";

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
        userAvatarUrl = "https://pbs.twimg.com/media/HIXLkfsaoAA9T7b.jpg", 
        content = "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
    } = question;

    const [isContentOpen, setIsContentOpen] = useState(false);
    // isDropDownOpen は子コンポーネントへ移動
    const [isOverflowing, setIsOverflowing] = useState(false);

    const textRef = useRef<HTMLParagraphElement>(null);
    
    const handleRemove = () => {
        // 削除処理の実装
        console.log("削除ボタンが押されました");
    }

    useEffect(() => {
        // ...既存の高さ計算のロジックそのまま...
        const checkLines = () => {
            if (textRef.current) {
                const el = textRef.current;
                const computedStyle = window.getComputedStyle(el);

                let lineHeight = parseFloat(computedStyle.lineHeight);
                if (isNaN(lineHeight)) {
                    lineHeight = parseFloat(computedStyle.fontSize) * 1.5;
                }

                const paddingTop = parseFloat(computedStyle.paddingTop);
                const paddingBottom = parseFloat(computedStyle.paddingBottom);
                const contentHeight = el.scrollHeight - paddingTop - paddingBottom;
                const threeLinesHeight = lineHeight * 3;

                if (contentHeight > threeLinesHeight) {
                    setIsOverflowing(true);
                    setIsContentOpen(false); 
                } else {
                    setIsOverflowing(false);
                    setIsContentOpen(true);
                }
            }
        };
        checkLines();
        const handleResize = () => {
            if (isContentOpen) {
                checkLines();
            }
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [content])

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between py-[var(--spacing-16)]">
                <div className="flex items-center gap-4">
                    <StatusChip id={statusId} />
                    <h2 className="text-[length:var(--font-size-big)]">
                        {title}
                    </h2>
                </div>

                {/* 切り出したコンポーネントを配置 */}
                <CardActionMenu 
                    isContentOpen={isContentOpen}
                    setIsContentOpen={setIsContentOpen}
                    onRemove={handleRemove}
                />
            </div>

            {/* 中央：質問本文 */}
            <div className="relative">
                <p ref={textRef} className={`px-[var(--spacing-16)] py-[var(--spacing-8)] text-[length:var(--font-size-medium)] transition-all duration-300 ${!isContentOpen ? "max-h-[calc(3em*1.6+var(--spacing-16))] overflow-hidden" : ""}`}>
                    {content}{isContentOpen ? '' : '・・・'}
                </p>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white pointer-events-none" style={{ display: isContentOpen ? 'none' : 'block' }} />
            </div>

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