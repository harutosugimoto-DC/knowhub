import Time from './Time';
import { useNavigate } from 'react-router';

export type NotificationItemProps = {
    createdAt: string;
    id: string,
    isRead: boolean;
    linkUrl: string;
    senderIcon: string,
    senderName: string,
    type: string;
    questionTitle:string
};
export default function NotificationItem({ linkUrl, type, createdAt, isRead, id, senderIcon, senderName, questionTitle }: NotificationItemProps) {
    const navigate = useNavigate()

    const choiceMessage = () => {
        switch (type) {
            case "answer_posted":
                return `${senderName}さんがあなたの質問に回答しました。`
            case "best_answer_selected":
                return `質問「${questionTitle}」であなたの回答が選出されました！`
            case "question_reaction":
                return `質問「${questionTitle}」にいいねが押されました！`
            case "answer_reaction":
                return `あなたの回答にいいねが押されました！`
            case "question_status":
                return `質問「${questionTitle}」が解決しました`
            default:
                return "不明な通知";
        }
    }
    return (
        <div className="w-full flex items-top p-[var(--spacing-16)] pl-[var(--spacing-8)] gap-2 cursor-pointer hover:bg-[var(--hover-color)] transition-colors" onClick={() => navigate(linkUrl)}>
            <div className='flex flex-col items-end gap-1 flex-grow'>
                <div className='flex items-start gap-2 w-full'>
                    {
                        !isRead && (
                            <div className="w-[10px] h-[10px] rounded-full bg-[var(--main-color)] mt-[var(--spacing-8)]"></div>
                        )
                    }
                    <p className='w-full'>{choiceMessage()}</p>
                </div>
                <Time postingTime={createdAt} />
            </div>
        </div>
    );
}