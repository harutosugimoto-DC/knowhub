import { useState } from "react";
import Avatar from "../common/Avatar";
import CardActionMenu from "../common/CardActionMenu";
import CollapsibleContent from "../common/CollapsibleContent";
import Like from "../common/Like";
import Time from "../common/Time";

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';

import { type AnswerReplyType } from "@/types/answer";

type ThreadReplyProps = {
    reply: AnswerReplyType;
};
export default function ThreadReply({ reply }: ThreadReplyProps) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const {
        id,
        iconURL,
        userName,
        content,
        postingTime,
        likeCount,
        replyCount,
        isLiked
    } = reply;

    return (
        <div className="flex">
            <div className="pr-[var(--spacing-16)] flex justify-top items-start">
                <SubdirectoryArrowRightOutlinedIcon className="text-[var(--dark-gray)]" />
                <div className="w-[3px] h-full bg-[var(--main-color)] opacity-[0.5]"></div>
            </div>
            <div className="flex flex-col gap-2 p-4 flex-1 rounded-[4px] border border-[var(--light-gray)] bg-[var(--light-gray)]/15">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 py-[4px]">
                        <Avatar src={iconURL} className="w-[32px] h-[32px]" />
                        <p>{userName}</p>
                        <Time postingTime={postingTime} />
                    </div>
                    <CardActionMenu isContentOpen={isContentOpen} setIsContentOpen={setIsContentOpen} onRemove={() => { }} isOverflowing={isOverflowing} />
                </div>
                <CollapsibleContent content={content} isContentOpen={isContentOpen} setIsContentOpen={setIsContentOpen} setIsOverflowing={setIsOverflowing} />
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button className="cursor-pointer rounded-[4px] w-[88px] h-[32px] flex items-center justify-center border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all">返信</button>
                        <button className={`${replyCount === 0 ? "hidden" : "flex"} text-[var(--dark-gray)] cursor-pointer items-center`} onClick={() => setIsReplyOpen(!isReplyOpen)}>
                            {isReplyOpen ? '返信を非表示' : `返信を表示`}({replyCount})
                            {!isReplyOpen && <KeyboardArrowDownOutlinedIcon />}
                            {isReplyOpen && <KeyboardArrowUpOutlinedIcon />}
                        </button>
                    </div>
                    <div className="h-[40px] flex gap-8">
                        <Like id={id} type="answer" count={likeCount} isLiked={isLiked} />
                    </div>
                </div>
            </div>
        </div>
    );
}