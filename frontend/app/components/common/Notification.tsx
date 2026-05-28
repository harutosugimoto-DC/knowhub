import Card from "./Card";
import type { NotificationItemProps } from "./NotificationItem";
import NotificationItem from "./NotificationItem";
import ScrollBar from "./ScrollBar";



type NotificationProps = {
    notifications: NotificationItemProps[];
};
const calculateUnreadCount = (notifications: NotificationItemProps[]) => {
    let count = 0;
    notifications.forEach(notification => {
        if (notification.isRead) {
            count++;
        }
    });
    return count;
}
export default function Notification({ notifications }: NotificationProps) {

    return (
        <Card className="w-[400px] max-h-[400px] flex flex-col gap-2">
            <div className="flex justify-between border-b border-[var(--light-gray)] py-[var(--spacing-8)]">
                <h2 className="text-[length:var(--font-size-big))]">通知</h2>
                <p className="text-[var(--dark-gray)] flex items-center">
                    {calculateUnreadCount(notifications)}件の未読
                </p>
            </div>
            <ScrollBar>
                {notifications.map((notification, i) => (
                    <NotificationItem
                        key={i}
                        createdAt={notification.createdAt}
                        id={notification.id}
                        isRead={notification.isRead}
                        linkUrl={notification.linkUrl}
                        senderIcon={notification.senderIcon}
                        senderName={notification.senderName}
                        type={notification.type}
                        questionTitle={notification.questionTitle}
                    />
                ))}
            </ScrollBar>

        </Card>
    );
}