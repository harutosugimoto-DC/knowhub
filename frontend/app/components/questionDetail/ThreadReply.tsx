import { useState } from "react";
import Avatar from "../common/Avatar";
import CardActionMenu from "../common/CardActionMenu";
import CollapsibleContent from "../common/CollapsibleContent";
import Like from "../common/Like";
import Time from "../common/Time";

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';

import type { AnswerReplyType } from "@/types/answer";

type ThreadReplyProps = {
    id: string;
    userId: string;
    iconURL: string;
    userName: string;
    content: string;
    postingTime: string;
    likeCount: number;
    isLiked: boolean;
    replies: AnswerReplyType[];
    depth?: number;
    currentUserId?: string;
    onReply?: (preview: { id: string; iconURL: string; userName: string; content: string; postingTime: string }) => void;
    onDeleteReply?: (replyId: string) => Promise<void>;
};

const MAX_REPLY_DEPTH = 3;

export default function ThreadReply({
    id,
    userId,
    iconURL,
    userName,
    content,
    postingTime,
    likeCount,
    isLiked,
    replies,
    depth = 0,
    currentUserId,
    onReply,
    onDeleteReply,
}: ThreadReplyProps) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const replyCount = replies?.length ?? 0;
    const canReply = depth < MAX_REPLY_DEPTH;

    return (
        <div className="flex">
            <div className="pr-[var(--spacing-16)] flex justify-top items-start">
                <SubdirectoryArrowRightOutlinedIcon className="text-[var(--dark-gray)]" />
                <div className="w-[3px] h-full bg-[var(--main-color)] opacity-[0.5]"></div>
            </div>
            <div className="flex flex-col gap-2 p-4 flex-1 rounded-[4px]
             border border-[var(--light-gray)] bg-[var(--light-gray)]/15">

                <div className="flex justify-between items-center">
                    <div className="flex gap-2 py-[4px]">
                        <Avatar src={iconURL} className="w-[32px] h-[32px]" />
                        <p>{userName}</p>
                        <Time postingTime={postingTime} />
                    </div>
                    <CardActionMenu
                        isContentOpen={isContentOpen}
                        setIsContentOpen={setIsContentOpen}
                        onRemove={userId === currentUserId ? () => onDeleteReply?.(id) : undefined}
                        isOverflowing={isOverflowing}
                    />
                </div>

                <CollapsibleContent
                    content={content}
                    isContentOpen={isContentOpen}
                    setIsContentOpen={setIsContentOpen}
                    setIsOverflowing={setIsOverflowing}
                />

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {canReply && (
                            <button
                                className="cursor-pointer rounded-[4px] w-[88px] h-[32px]
                                flex items-center justify-center border border-[var(--accent-color)]
                                text-[var(--accent-color)] hover:bg-[var(--accent-color)]
                                hover:text-white transition-all"
                                onClick={() => onReply?.({ id, iconURL, userName, content, postingTime })}
                            >
                                返信
                            </button>
                        )}

                        {replyCount > 0 && (
                            <button
                                className="flex items-center text-[var(--dark-gray)] cursor-pointer"
                                onClick={() => setIsReplyOpen(!isReplyOpen)}
                            >
                                {isReplyOpen ? '返信を非表示' : '返信を表示'}({replyCount})
                                {isReplyOpen
                                    ? <KeyboardArrowUpOutlinedIcon />
                                    : <KeyboardArrowDownOutlinedIcon />
                                }
                            </button>
                        )}
                    </div>
                    <div className="h-[40px] flex gap-8">
                        <Like id={id} type="answer" count={likeCount} isLiked={isLiked} />
                    </div>
                </div>

                {isReplyOpen && replies && replies.map((reply) => (
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
                        depth={depth + 1}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onDeleteReply={onDeleteReply}
                    />
                ))}
            </div>
        </div>
    );
}
