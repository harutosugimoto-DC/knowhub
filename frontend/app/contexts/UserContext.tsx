import { createContext, useContext, useState, useEffect, type Dispatch, type ReactNode, type SetStateAction } from 'react'; // 🟢 useEffect を追加
import { supabase } from '@/lib/supabase';
import { authService } from '@/api/authService';

export interface UserProfile {
    id: string;
    nickname: string | null;
    iconUrl: string;
}

interface UserContextType {
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    useEffect(() => {
        const restoreUserSession = async () => {
            try {
                // 1. Supabase に「ログイン中のセッションが残っているか」確認
                const { data: { session } } = await supabase.auth.getSession();
                
                // セッションがなければ未ログイン状態のまま終了（ログイン画面ならそのまま）
                if (!session) return;

                // 2. localStorage に最新のトークンとIDをセット
                localStorage.setItem("token", session.access_token);
                localStorage.setItem("userId", session.user.id);

                const profile = await authService.getUserProfile();
                
                setUser({
                    id: profile.id,
                    nickname: profile.nickname,
                    iconUrl: profile.profile_icon_url
                });

            } catch (err) {
                console.error("グローバルセッション復旧エラー:", err);
                // ネットワークエラーなどで取得失敗した場合は安全のため一度ログアウト状態にする
                // (401エラー等の場合は axiosClient の共通処理で自動ログアウトさせるのもアリです)
            }
        };

        restoreUserSession();
    }, []);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Supabaseサインアウトエラー:", err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within an UserProvider');
    }
    return context;
}