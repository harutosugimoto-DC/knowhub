import type { AnswerReplyType, AnswerType } from "@/types/answer";
import { useState } from "react";
import Card from "../common/Card";
import Avatar from "../common/Avatar";
import Time from "../common/Time";
import CardActionMenu from '@/components/common/CardActionMenu';
import CollapsibleContent from "../common/CollapsibleContent";
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import Like from "../common/Like";
import ThreadReply from "./ThreadReply";


type AnswerCardProps = {
    answer: AnswerType;
    statusId: string;
    isOwner: boolean;
    currentUserId: string;
    onBestAnswer: (answerId: string) => void;
    onReply: (answerId: string) => void;
    onThreadReply: (preview: { id: string; iconURL: string; userName: string; content: string; postingTime: string }) => void;
    onDeleteAnswer: (answerId: string) => Promise<void>;
    onDeleteReply: (replyId: string) => Promise<void>;
};

export default function AnswerCard({ answer, statusId, isOwner, currentUserId, onBestAnswer, onReply, onThreadReply, onDeleteAnswer, onDeleteReply }: AnswerCardProps) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const isResolved = statusId === '解決済み';
    const showBestAnswerButton = isOwner && !isResolved && !answer.isBestAnswer;

    return (
        <Card
            className={[
                'flex flex-col gap-2',
                answer.isBestAnswer ? 'border-r-4 border-r-[var(--main-color)]' : '',
            ].join(' ')}
        >
            <div className="flex justify-between items-center">
                <div className="flex gap-2 py-[4px]">
                    <Avatar src={answer.iconURL} className="w-[32px] h-[32px]" />
                    <p>{answer.userName}</p>
                    <Time postingTime={answer.postingTime} />
                </div>

                <div className="flex items-center gap-2">
                    {answer.isBestAnswer && (
                        <div className="flex items-center gap-2 text-[var(--main-color)]">
                            <EmojiEventsOutlinedIcon />
                            <p>ベストアンサー</p>
                        </div>
                    )}
                    <CardActionMenu
                        isContentOpen={isContentOpen}
                        setIsContentOpen={setIsContentOpen}
                        onRemove={answer.userId === currentUserId && !answer.isBestAnswer ? () => onDeleteAnswer(answer.id) : undefined}
                        isOverflowing={isOverflowing}
                    />
                </div>
            </div>

            <CollapsibleContent
                content={answer.content}
                isContentOpen={isContentOpen}
                setIsContentOpen={setIsContentOpen}
                setIsOverflowing={setIsOverflowing}
            />

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        className="cursor-pointer rounded-[4px] w-[88px] h-[32px] flex items-center justify-center border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all"
                        onClick={() => onReply(answer.id)}
                    >
                        返信
                    </button>

                    {answer.replies.length > 0 && (
                        <button
                            className="flex items-center text-[var(--dark-gray)] cursor-pointer"
                            onClick={() => setIsReplyOpen((prev) => !prev)}
                        >
                            {isReplyOpen ? '返信を非表示' : '返信を表示'}
                            ({answer.replies.length})
                            {isReplyOpen ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
                        </button>
                    )}
                </div>

                <div className="h-[40px] flex gap-8 items-center">
                    {showBestAnswerButton && (
                        <button
                            onClick={() => {
                                const confirmed = window.confirm("この回答をベストアンサーに設定しますか？");
                                if (!confirmed) return;
                                onBestAnswer(answer.id)
                            }}
                            className="transition-all hover:bg-[var(--main-color)] hover:text-white cursor-pointer flex items-center gap-1 text-[var(--main-color)] px-[var(--spacing-16)] py-[var(--spacing-8)] rounded-[4px] border border-[var(--main-color)]"
                        >
                            <EmojiEventsOutlinedIcon />
                            <p>ベストアンサーに選ぶ</p>
                        </button>
                    )}
                    <Like id={answer.id} type="answer" count={answer.likeCount} isLiked={answer.isLiked} />
                </div>
            </div>

            {isReplyOpen && answer.replies.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="bg-[var(--light-gray)] h-[1px] w-full" />
                    {answer.replies.map((reply: AnswerReplyType) => (
                        <ThreadReply
                            key={reply.id}
                            id={reply.id}
                            userId={reply.userId}
                            iconURL={reply.iconURL}
                            userName={reply.userName}
                            content={reply.content}
                            postingTime={reply.postingTime}
                            likeCount={reply.likeCount}
                            isLiked={reply.isLiked}
                            replies={reply.replies}
                            depth={1}
                            currentUserId={currentUserId}
                            onReply={(preview) => onThreadReply(preview)}
                            onDeleteReply={onDeleteReply}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}