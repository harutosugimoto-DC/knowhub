import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Card from "@/components/common/Card";
import StatusChip from "@/components/common/StatusChip";
import TagChip from "@/components/common/TagChip";
import Bookmark from "@/components/common/Bookmark";
import Like from "@/components/common/Like";
import Comment from "@/components/common/Comment";

type QuestionCardProps = {
    title: string;
    statusId: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    userName: string;
    postingTime: Date;
    likeCount: number;
    bookmarkCount: number;
    replyCount: number;
    tagNames: string[];
};

export default function QuestionCard({
    title,
    statusId,
    isLiked = false,
    isBookmarked = false,
    userName,
    postingTime,
    likeCount,
    bookmarkCount,
    replyCount,
    tagNames
}: QuestionCardProps) {

    // 投稿日時（Date）から「〜時間前」という文字列を計算する簡易的な関数
    const getTimeAgo = (date: Date) => {
        const diffMs = new Date().getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffMonths / 12);

        if (diffHours < 1) return "たった今";
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 30) return `${diffDays}日前`;
        if (diffMonths > 0) return `${diffMonths}ヶ月前`;
        if (diffYears > 0) return `${diffYears}年前`;
        return "不明な時間";
    };

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
                        <AccountCircleIcon className="!text-[var(--font-size-normal)] text-[var(--text-color-black)]" />
                        <span className="text-[var(--text-color-black)]">{userName}</span>
                    </div>
                    <div className="flex items-center gap-[var(--spacing-4)] text-[var(--dark-gray)]">
                        <AccessTimeIcon className="!text-[var(--font-size-normal)]" />
                        <span>{getTimeAgo(postingTime)}</span>
                    </div>
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