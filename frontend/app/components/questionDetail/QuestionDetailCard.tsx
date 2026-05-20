import Card from "../common/Card";
import Bookmark from "../common/Bookmark";
import Like from "../common/Like";
import Comment from "../common/Comment";
import TagChip from "../common/TagChip";
import StatusChip from "../common/StatusChip";


import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { FaTrashAlt } from "react-icons/fa";

import { type QuestionType } from "@/types/question.ts";
import { useEffect, useRef, useState } from "react";

// 本文用のプロパティ(content)を必要に応じて追加しています
type QuestionDetailCardProps = {
    question: QuestionType & { content?: string };
}

export default function QuestionDetailCard({ question }: QuestionDetailCardProps) {
    const {
        title,
        statusId,
        isLiked = false,
        isBookmarked = false,
        userName,      // 画像のUI範囲外のため未使用
        postingTime,   // 画像のUI範囲外のため未使用
        likeCount,
        bookmarkCount,
        replyCount,
        tagNames,
        userAvatarUrl = "https://pbs.twimg.com/media/HIXLkfsaoAA9T7b.jpg", // 画像のUI範囲外のため未使用
        content = "現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
    } = question;

    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isDropDownOpen, setIsDropdownOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const textRef = useRef<HTMLParagraphElement>(null);
    const handleRemove=()=>{
            // 削除処理の実装
    }
    useEffect(() => {
        const checkLines = () => {
            if (textRef.current) {
                const el = textRef.current;
                const computedStyle = window.getComputedStyle(el);

                // 1. 1行の高さ（line-height）を取得。取得できない場合は fontSize * 1.5 で代用
                let lineHeight = parseFloat(computedStyle.lineHeight);
                if (isNaN(lineHeight)) {
                    lineHeight = parseFloat(computedStyle.fontSize) * 1.5;
                }

                // 2. Paddingの高さを取得（scrollHeightにはpaddingも含まれるため除外して計算する）
                const paddingTop = parseFloat(computedStyle.paddingTop);
                const paddingBottom = parseFloat(computedStyle.paddingBottom);

                // 3. 純粋なテキストコンテンツだけの実際の高さを算出
                const contentHeight = el.scrollHeight - paddingTop - paddingBottom;

                // 4. 3行分の高さを計算 (余裕を持たせるため 3.1 などを掛ける場合もあります)
                const threeLinesHeight = lineHeight * 3;

                // 5. 実際の高さが3行分を超えているか判定
                if (contentHeight > threeLinesHeight) {
                    setIsOverflowing(true);
                    setIsContentOpen(false); // 3行以上なら閉じる
                } else {
                    setIsOverflowing(false);
                    setIsContentOpen(true);
                }
            }
        };
        checkLines();
        const handleResize = () => {
            // 閉じている場合のみ高さを再チェック
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

                <div className="flex items-center text-[var(--dark-gray)] gap-4">
                    <div className="relative">
                        <MoreVertOutlinedIcon className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropDownOpen)} />
                        {isDropDownOpen && (
                            <div className="transition-all hover:bg-[var(--hover-color)] cursor-pointer flex items-center justify-center bg-white rounded-[var(--spacing-4)] absolute left-0 translate-x-[-50%] shadow-[var(--box-shadow)] border border-[var(--light-gray)] w-[128px] h-[40px] z-10" onClick={handleRemove()}>
                                <button className="flex items-center justify-center gap-4 text-[var(--danger-color)] pointer-events-none">
                                    <FaTrashAlt />
                                    <p>削除</p>
                                </button>
                            </div>
                        )}
                    </div>
                    {isContentOpen && <KeyboardArrowDownOutlinedIcon className="cursor-pointer" onClick={() => setIsContentOpen(false)} />}
                    {!isContentOpen && <KeyboardArrowUpOutlinedIcon className="cursor-pointer" onClick={() => setIsContentOpen(true)} />}
                </div>
            </div>

            {/* 中央：質問本文 */}
            <div className="relative">
                <p ref={textRef} className={`px-[var(--spacing-16)] py-[var(--spacing-8)] text-[length:var(--font-size-medium)] transition-all duration-300 ${!isContentOpen ? "max-h-[calc(3em*1.6+var(--spacing-16))] overflow-hidden" : ""}`}>
                    {content}{isContentOpen ? '' : '・・・'}
                </p>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white pointer-events-none" style={{ display: isContentOpen ? 'none' : 'block' }} />
            </div>

            {/* 下部：タグリスト、各種アクション（いいね等） */}
            <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between">

                {/* タグリスト */}
                <div className="flex flex-wrap gap-2">
                    {tagNames?.map((tag, index) => (
                        // TagChipは text プロパティを受け取る
                        <TagChip key={index} text={tag} />
                    ))}
                </div>

                {/* アクション数 */}
                <div className="flex items-center gap-2 ">
                    <Bookmark
                        isBookmarked={isBookmarked}
                        count={bookmarkCount}
                    />
                    <Like
                        isLiked={isLiked}
                        count={likeCount}
                    />
                    <Comment
                        count={replyCount}
                    />
                </div>
            </div>
        </Card>
    );
}