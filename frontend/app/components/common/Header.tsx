import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

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
import { toast } from "@/utils/toast";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation()
    const { user, logout } = useUser();
    const isLoggedIn = !!user;

    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    
    useEffect(()=>{
        //通知部分以外をクリックしたときに通知を閉じる
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.notification-container') && !target.closest('.notification-icon')) {
                setShowNotification(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    },[])
    useEffect(() => {
        setShowNotification(false);
    }, [location.pathname]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    useEffect(() => {
        if (!isLoggedIn || !user?.id) {
            setNotifications([]);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();
                setNotifications(response);
            } catch (err) {
                console.error("❌ [API] 通知の取得に失敗しました:", err);
            }
        };

        // ① 初回レンダリング時に既存の通知を取得
        fetchNotifications();

        // ② Supabase Realtime でデータベースの変更をリアルタイム監視

        const channelName = `realtime-notifications-${user.id}-${Math.random().toString(36).slice(2)}`;

        const targetFilter = `receiver_user_id=eq.${user.id}`;

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: targetFilter,
                },
                async (payload) => {
                    if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                        await fetchNotifications();
                    }
                }
            )
            .subscribe((status, error) => {
                if (error) {
                    console.error("❌ [Realtime接続エラー詳細]:", error);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn, user?.id]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('ログアウトしました。');
            navigate("/");
        } catch {
            toast.error('ログアウトに失敗しました。時間をおいて再度お試しください。');
        }
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
                    <div className="notification-icon w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={toggleNotification}>
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
                <div className="notification-container absolute top-[64px] right-[var(--spacing-16)] shadow-[var(--box-shadow)] rounded-[var(--radius-big)] overflow-hidden bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                    <Notification notifications={notifications} />
                </div>
            )}
        </div>
    );
}
