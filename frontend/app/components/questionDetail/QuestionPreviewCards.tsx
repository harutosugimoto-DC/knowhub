// src/components/questionDetail/QuestionPreviewCards.tsx

import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Time from '@/components/common/Time';
import Like from '@/components/common/Like';
import Bookmark from '@/components/common/Bookmark';
import Comment from '@/components/common/Comment';
import StatusChip from '@/components/common/StatusChip';
import TagChip from '@/components/common/TagChip';
import ScrollBar from '@/components/common/ScrollBar';

import type { QuestionDetail } from '@/types/question';
import type { AnswerType, AnswerReplyType } from '@/types/answer';

// 回答作成時の質問プレビュー専用
export function AnswererQuestionPreviewCard({ question }: { question: QuestionDetail }) {
    return (
        <Card className="w-full px-4 py-2 flex flex-col h-full max-h-[200px] overflow-hidden">
            <div className="flex items-center justify-between pb-[var(--spacing-16)] shrink-0">
                <div className="flex items-center gap-4">
                    <StatusChip name={question.statusId} />
                    <h2 className="text-[length:var(--font-size-big)]">{question.title}</h2>
                </div>
            </div>
            <div className='!select-text flex-1 min-h-0 flex flex-col max-h-[64px]'>
                <ScrollBar className='h-full overflow-auto px-[var(--spacing-16)]'>
                    <p className="!select-text text-[length:var(--font-size-medium)] leading-relaxed whitespace-pre-wrap break-all">
                        {question.content}
                    </p>
                </ScrollBar>
            </div>
            <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between shrink-0">
                <div className="flex flex-wrap gap-2">
                    {question.tagNames?.map((tag, idx) => <TagChip key={idx} text={tag} />)}
                </div>
                <div className="flex items-center gap-2">
                    <Bookmark id={question.id} isBookmarked={question.isBookmarked ?? false} count={question.bookmarkCount} />
                    <Like id={question.id} type='question' isLiked={question.isLiked ?? false} count={question.likeCount} />
                    <Comment count={question.replyCount} />
                </div>
            </div>
        </Card>
    );
}

// 回答返信モーダル内のプレビューカード
export function AnswerPreviewCard({ answer }: { answer: AnswerType }) {
    return (
        <Card className="w-full">
            <div className="flex gap-2 py-[4px] mb-2">
                <Avatar src={answer.iconURL} className="w-[32px] h-[32px]" />
                <p>{answer.userName}</p>
                <Time postingTime={answer.postingTime} />
            </div>
            <ScrollBar className='max-h-[64px] overflow-auto px-[var(--spacing-16)]'>
                <p className="!select-text text-[length:var(--font-size-medium)] leading-relaxed">
                    {answer.content}
                </p>
            </ScrollBar>
            <div className="flex justify-end mt-2">
                <Like id={answer.id} type='answer' count={answer.likeCount} isLiked={answer.isLiked} />
            </div>
        </Card>
    );
}

// ThreadReply返信モーダル内のプレビューカード
export function ReplyPreviewCard({ reply }: { reply: Pick<AnswerReplyType, 'iconURL' | 'userName' | 'content' | 'postingTime'> }) {
    return (
        <Card className="w-full">
            <div className="flex gap-2 py-[4px] mb-2">
                <Avatar src={reply.iconURL} className="w-[32px] h-[32px]" />
                <p>{reply.userName}</p>
                <Time postingTime={reply.postingTime} />
            </div>
            <p className="!select-text px-[var(--spacing-16)] text-[length:var(--font-size-medium)] leading-relaxed max-h-[120px] overflow-auto">
                {reply.content}
            </p>
        </Card>
    );
}