import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import Card from "@/components/common/Card";
import StatusChip from "@/components/common/StatusChip";
import TagChip from "@/components/common/TagChip";
import Bookmark from "@/components/common/Bookmark";
import Like from "@/components/common/Like";
import Comment from "@/components/common/Comment";
import Time from '../common/Time';
import Avatar from '../common/Avatar';
import { type QuestionType } from "@/types/question";


type QuestionCardProps = {
    question: QuestionType; 
};

export default function QuestionCard({ question }: QuestionCardProps) {
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
    } = question;
    return (
        <Card className="flex justify-between">
            <div className='flex flex-col justify-space-around gap-[var(--spacing-16)]'>
                {/* 一段目 */}
                <div className="flex items-center gap-[var(--spacing-16)]">
                    <StatusChip id={statusId} />
                </div>

                {/* 二段目 */}
                <h2 className="!text-[length:var(--font-size-big)] font-medium">
                    {title}
                </h2>

                {/* 三段目 */}
                <div className="flex items-center gap-[var(--spacing-16)]">
                    <div className="flex items-center gap-[var(--spacing-4)]">
                        <Avatar src={userAvatarUrl} alt="User Avatar" className="w-[24px] h-[24px]" />
                        <span className="text-[var(--text-color-black)]">{userName}</span>
                    </div>
                    <Time postingTime={postingTime} />
                </div>

                {/* 四段目 */}

                <div className="flex flex-wrap gap-[var(--spacing-8)]">
                    {tagNames.map((tag, index) => (
                        <TagChip key={index} text={tag} />
                    ))}
                </div>
            </div>
            <div className='flex items-end flex-row gap-1'>
                <Bookmark isBookmarked={isBookmarked} count={bookmarkCount} />
                <Like isLiked={isLiked} count={likeCount} />
                <Comment count={replyCount} />
            </div>
        </Card>
    );
}