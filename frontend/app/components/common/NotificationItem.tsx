
import Time from './Time';
import { useNavigate } from 'react-router';

export type NotificationItemProps = {
    linkUrl: string;
    type: string;
    createdAt: Date;
    isRead: boolean;
};
export default function NotificationItem({ linkUrl, type, createdAt, isRead }: NotificationItemProps) {
    const navigate = useNavigate()
    const choiceMessage = () => {
        switch (type) {
            case "あなたの質問に回答がつきました":
                return "あなたの質問に回答がつきました";
            case "あなたの回答にコメントがつきました":
                return "あなたの回答にコメントがつきました";
            default:
                return "";
        }
    }
    return (
        <div className="w-full flex items-top p-[var(--spacing-16)] pl-[var(--spacing-8)] gap-2 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate(linkUrl)}>
            <div className='flex flex-col items-end gap-1 flex-grow'>
                <div className='flex items-center gap-2 w-full'>
                    {
                        isRead ? (
                            <div className="w-[10px] h-[10px] rounded-full bg-[var(--main-color)]"></div>
                        ) : <></>
                    }
                    <p className='w-full'>{choiceMessage()}</p>
                </div>
                <Time postingTime={createdAt} />
            </div>
        </div>
    );
}