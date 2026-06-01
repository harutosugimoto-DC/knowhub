import axiosClient from "./axiosClient";

export interface NotificationType {
    id: string;
    isRead: boolean;
    createdAt: string;
    linkUrl: string;
    type: string;       // notification_types.name をここに平坦化
    senderName: string; // sender.nickname をここに平坦化
    senderIcon: string; // sender.profile_icon_url をここに平坦化
}

/**
 * ログインユーザーの通知一覧を取得する
 */
export const getNotifications = async (): Promise<NotificationType[]> => {
    const response = await axiosClient.get<any[]>('/notifications');

    return response.data.map((n) => ({
        id: n.id,
        isRead: n.is_read,
        createdAt: n.created_at,
        linkUrl: n.link_url,
        type: n.notification_types.name,
        senderName: n.sender.nickname,
        senderIcon: n.sender.profile_icon_url,
        questionTitle: n.questions?.title || null,
    }));
};
/**
 * 通知を既読化する
 * @param notificationId 
 */

export const readNotification = async (notificationId:string): Promise<void> => {
    const response = await axiosClient.patch<void>(`/notifications/${notificationId}/read`);
}

const notificationService = {
    getNotifications,
};

export default notificationService;