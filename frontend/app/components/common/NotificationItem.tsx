import Time from './Time';
import { useNavigate } from 'react-router';

export type NotificationItemProps = {
    linkUrl: string;
    type: string;
    createdAt: Date;
    isRead: boolean;
};
export default function NotificationItem({ linkUrl, type, createdAt, isRead }: NotificationItemProps) {
    const navigate = useNavigate();

    const choiceMessage = () => {
        switch (type) {
            case "question":
                return "あなたの質問に回答がつきました";
            case "like":
                return "あなたの回答にいいねがつきましたあああああああああああああ！";
            default:
                return "";
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