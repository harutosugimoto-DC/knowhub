import Card from "@/components/common/Card";
import StatusChip from "@/components/common/StatusChip";
import TagChip from "@/components/common/TagChip";
import Bookmark from "@/components/common/Bookmark";
import Like from "@/components/common/Like";
import Comment from "@/components/common/Comment";
import Time from '../common/Time';
import Avatar from '../common/Avatar';
import { type QuestionType } from "@/types/question";
import { useNavigate } from 'react-router';
import { MY_ACTIONS } from "@/constants/Filter";

type QuestionCardProps = {
    question: QuestionType;
    isProfile?: boolean;
};

export default function QuestionCard({ question, isProfile }: QuestionCardProps) {
    const navigate = useNavigate()
    const {
        id,
        title,
        iconUrl,
        statusId,
        isLiked = false,
        isBookmarked = false,
        userName,
        postingTime,
        likeCount,
        bookmarkCount,
        replyCount,
        tagNames,
        myActions,
    } = question;
    return (
        <div className="rounded-4 cursor-pointer" onClick={() => navigate(`/question/${id}`)}>
            <Card className={`${isProfile ? "border border-[var(--light-gray)]" : ""}  transition-all hover:shadow-[var(--hover-box-shadow)] hover:bg-[var(--hover-color)] flex justify-between`}>
                <div className='flex flex-col justify-space-around gap-[var(--spacing-16)]'>
                    {/* 一段目 */}
                    <div className="flex items-center gap-[var(--spacing-16)]">
                        <StatusChip name={statusId} />
                        {
                            myActions.map((myAction) => {
                                const targetAction = MY_ACTIONS.find((action) => action.id === myAction);
                                return (
                                    <div className={`bg-white border border-[var(--main-color)] rounded-[var(--radius-big)] inline-flex items-center justify-center text-[var(--main-color)] px-[var(--spacing-16)] py-[var(--spacing-12)]`}>
                                        <div className="flex items-center h-[12px]">{targetAction ? targetAction.name : ""}</div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    {/* 二段目 */}
                    <h2 className="!text-[length:var(--font-size-big)] font-medium">
                        {title}
                    </h2>

                    {/* 三段目 */}
                    <div className="flex items-center gap-[var(--spacing-16)]">
                        <div className="flex items-center gap-[var(--spacing-4)]">
                            <Avatar src={iconUrl} className="w-[24px] h-[24px]" />
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
                    <Bookmark id={id} isBookmarked={isBookmarked} count={bookmarkCount} />
                    <Like id={id} type="question" isLiked={isLiked} count={likeCount} />
                    <Comment count={replyCount} />
                </div>
            </Card>
        </div>
    );
}