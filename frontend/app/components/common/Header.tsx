import { useState } from "react";
import { useNavigate } from "react-router";

import Avatar from "@/components/common/Avatar";
import Notification from "@/components/common/Notification";

import logoImage from "@/assets/logo.webp";
import avatarImage from "@/assets/avatar.png";

import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { HiMiniPencilSquare } from "react-icons/hi2";

export default function Header() {
    const [showNotification, setShowNotification] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            linkUrl: "/question/1",
            type: "question",
            createdAt: new Date(),
            isRead: false
        },
        {
            linkUrl: "/question/2",
            type: "question",
            createdAt: new Date(),
            isRead: true
        },
        {
            linkUrl: "/question/2",
            type: "question",
            createdAt: new Date(),
            isRead: false
        },
        {
            linkUrl: "/question/2",
            type: "like",
            createdAt: new Date(),
            isRead: true
        },
        {
            linkUrl: "/question/2",
            type: "like",
            createdAt: new Date(),
            isRead: false
        },
        {
            linkUrl: "/question/2",
            type: "question",
            createdAt: new Date(),
            isRead: true
        }
    ]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        //仮の実装
        localStorage.removeItem("userId");
    }
    const toggleNotification = () => {
        //仮の実装
        setShowNotification(!showNotification);
    }
    const navigate = useNavigate()
    return (
        <div className="flex justify-between items-center h-[64px] w-[100vw] border-b border-[var(--light-gray)] pl-[var(--spacing-16)] z-[var(--z-header)] fixed top-0 left-0 bg-white">
            <div className="flex items-center gap-2 px-[var(--spacing-8)] cursor-pointer" onClick={() => navigate("/top")}>
                <img src={logoImage} alt="Logo" className="w-auto h-[48px]" />
                <p className="text-[length:var(--font-size-big)] font-['Lora'] bg-[image:var(--gradation-green)] bg-clip-text text-transparent">
                    Knowhub
                </p>
            </div>
            <div className="flex items-center h-full">
                <div className=" w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/top")}>
                    <HomeIcon />
                </div>
                <div className=" w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/create-question")}>
                    <HiMiniPencilSquare className="text-[24px]" />
                </div>
                <div className=" w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => toggleNotification()}>
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
                <div className=" w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => navigate("/profile")}>
                    <Avatar src={"https://pbs.twimg.com/media/HIXLkfsaoAA9T7b.jpg"} alt="User Avatar" className="w-[40px] h-[40px]" />
                </div>
                <div className=" w-[60px] h-full flex justify-center items-center cursor-pointer transition-all hover:bg-[var(--hover-color)] hover:border-b-[3px] hover:border-[var(--main-color)]" onClick={() => handleLogout()}>
                    <LogoutIcon />
                </div>
            </div>
            {
                showNotification && (
                    <div
                        className="absolute top-[64px] right-[var(--spacing-16)] shadow-[var(--box-shadow)] rounded-[var(--radius-big)] overflow-hidden bg-white animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <Notification notifications={notifications} />
                    </div>
                )
            }
        </div >
    );
}