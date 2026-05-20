import Card from "../common/Card";

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useState } from "react";
import Avatar from "../common/Avatar";
import Time from "../common/Time";
import CardActionMenu from "../common/CardActionMenu";
import CollapsibleContent from "../common/CollapsibleContent";
import Like from "../common/Like";


type ThreadProps = {
    userName: string;
    content: string;
    postingTime: Date;
    likeCount: number;
    replyCount: number;
    isBestAnswer: boolean;

};
export default function Thread({ userName, content, postingTime, likeCount, replyCount, isBestAnswer }: ThreadProps) {

    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false);
    const handleBestAnswerClick=()=>{
        //ベストアンサーに選ぶ処理
    }
    return (
        <Card >
            <div className="flex justify-between items-center">
                <div className="flex gap-2 py-[4px]">
                    <Avatar className="w-[32px] h-[32px]" />
                    <p>{userName}</p>
                    <Time postingTime={postingTime} />
                </div>
                <CardActionMenu isContentOpen={isContentOpen} setIsContentOpen={setIsContentOpen} onRemove={() => { }} />
            </div>
            <CollapsibleContent content={content} isContentOpen={isContentOpen} setIsContentOpen={setIsContentOpen} />
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button className="cursor-pointer rounded-[4px] w-[88px] h-[32px] flex items-center justify-center border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all">返信</button>
                    <button className={`${replyCount === 0 ? "hidden" : "flex"} text-[var(--dark-gray)] cursor-pointer`} onClick={() => setIsReplyOpen(!isReplyOpen)}>{isReplyOpen ? '返信を非表示' : `返信を表示`}({replyCount})
                        {!isReplyOpen && <KeyboardArrowDownOutlinedIcon />}
                        {isReplyOpen && <KeyboardArrowUpOutlinedIcon />}
                    </button>
                </div>
                <div className="h-[40px] flex gap-8">
                    <button onClick={()=>handleBestAnswerClick()} className="transition-all hover:bg-[var(--main-color)] hover:text-white cursor-pointer flex items-center text-[var(--main-color)] px-[var(--spacing-16)] py-[var(--spacing-8)] rounded-[4px] border border-[var(--main-color)]">
                        <EmojiEventsOutlinedIcon />
                        <p>ベストアンサーに選ぶ</p>
                    </button>
                    <Like count={3} isLiked={false} />
                </div>
            </div>
        </Card>
    );
}