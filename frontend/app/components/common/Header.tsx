import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import Avatar from "@/components/common/Avatar";
import Notification from "@/components/common/Notification";

import logoImage from "@/assets/logo.webp";

import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { HiMiniPencilSquare } from "react-icons/hi2";
import { useUser } from "@/contexts/UserContext";
import { getNotifications, type NotificationType } from "@/api/notificationService";
import { supabase } from "@/lib/supabase";

export default function Header() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const isLoggedIn = !!user;

    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    useEffect(() => {
        // 未ログイン、またはユーザーIDが取得できない場合は購読しない
        if (!isLoggedIn || !user?.id) {
            setNotifications([]);
            return;
        }

        // ① 初回レンダリング時に既存の通知をAPIから取得
        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();
                console.log(response);

                setNotifications(response);
            } catch (err) {
                console.error("通知の取得に失敗しました:", err);
            }
        };
        fetchNotifications();

        // ② Supabase Realtime でデータベースの変更をリアルタイム監視
        // 既存の同名チャンネルを削除してから新規作成（React StrictMode の二重実行対策）
        const channelName = `realtime-notifications-${user.id}`;
        supabase.getChannels()
            .filter(ch => ch.topic === `realtime:${channelName}`)
            .forEach(ch => supabase.removeChannel(ch));

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "*", // INSERT, UPDATE, DELETE のすべてを検知
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`, // 💡 ログインユーザー自身の通知のみに絞り込み
                },
                (payload) => {
                    console.log(payload);

                    // 新しい通知が届いた時 (INSERT)
                    if (payload.eventType === "INSERT") {
                        const newNotification = payload.new as NotificationType;
                        setNotifications((prev) => [newNotification, ...prev]); // 配列の先頭に追加
                    }

                    // 通知が「既読」などに更新された時 (UPDATE)
                    else if (payload.eventType === "UPDATE") {
                        const updatedNotification = payload.new as NotificationType;
                        setNotifications((prev) =>
                            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                        );
                    }

                    // 通知が削除された時 (DELETE)
                    else if (payload.eventType === "DELETE") {
                        setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        // ③ クリーンアップ：コンポーネントがアンマウントされたら接続を解除
        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn, user?.id]);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const toggleNotification = () => {
        setShowNotification(!showNotification);
    }
    return (
        <div className="flex justify-between items-center h-[64px] w-[100vw] border-b border-[var(--light-gray)] pl-[var(--spacing-16)] z-[var(--z-header)] fixed top-0 left-0 bg-white">
            <div className="flex items-center gap-2 px-[var(--spacing-8)] cursor-pointer" onClick={() => navigate("/top")}>
                <img src={logoImage} alt="Logo" className="w-auto h-[48px]" />
                <p className="text-[length:var(--font-size-big)] font-['Lora'] bg-[image:var(--gradation-green)] bg-clip-text text-transparent">
                    Knowhub
                </p>
            </div>

            {isLoggedIn && (
            <div className="flex items-center h-full">
                <div className="w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/top")}>
                    <HomeIcon />
                </div>
                <div className="w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/create-question")}>
                    <HiMiniPencilSquare className="text-[24px]" />
                </div>
                <div className="w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={toggleNotification}>
                    <div className="relative inline-block">
                        <NotificationsIcon />
                        {unreadCount > 0 && (
                            <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-[20px] h-[20px] bg-[var(--main-color)] rounded-full flex justify-center items-center">
                                <span className="text-white text-[12px] leading-[20px]">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/profile")}>
                    <Avatar src={user.iconUrl} className="w-[40px] h-[40px]" />
                </div>
                <div className="w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={handleLogout}>
                    <LogoutIcon />
                </div>
            </div>
            )}
            {isLoggedIn && showNotification && (
                <div className="absolute top-[64px] right-[var(--spacing-16)] shadow-[var(--box-shadow)] rounded-[var(--radius-big)] overflow-hidden bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                    <Notification notifications={notifications} />
                </div>
            )}
        </div>
    );
}
