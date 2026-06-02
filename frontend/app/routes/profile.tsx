import { useEffect, useState } from "react";

import Card from "@/components/common/Card";
import SectionTitle from "@/components/common/SectionTitle";
import ProgressBar from "@/components/profile/ProgressBar";
import QuestionCard from "@/components/top/QuestionCard";
import Avatar from "@/components/common/Avatar";

import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { useUser } from "@/contexts/UserContext";
import { getMyData, getRecentlySolved, getTopTags, getActivity, updateProfileIcon } from "@/api/userService";
import { authService } from "@/api/authService";
import { toast } from "@/utils/toast";
import type { QuestionType } from "@/types/question";
import type { myData } from "@/types/user";

export default function Profile() {
    const { user, setUser } = useUser();

    // ─── 💡 Hooks (State) の定義：エラー回避のため必ずコンポーネントの最上部に並べる ───
    const [profileData, setProfileData] = useState<myData | null>(null);
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [topTags, setTopTags] = useState<{ name: string; count: number }[]>([]);
    const [graphData, setGraphData] = useState<{ month: string; count: number }[]>([]);

    // ニックネーム編集用のState
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(user?.nickname ?? "");

    // ─── 💡 useEffect でデータの一括取得 ───
    useEffect(() => {
        if (!user?.id) return;

        const fetchProfileData = async () => {
            try {
                const toDate = new Date();
                const fromDate = new Date();
                fromDate.setMonth(fromDate.getMonth() - 5); // 今月を含めて6ヶ月にするため「-5」

                // YYYY-MM 形式に変換するヘルパー関数
                const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const from = formatDate(fromDate); // 例: "2026-01"
                const to = formatDate(toDate);     // 例: "2026-06"

                const myDetails = await getMyData();
                const recentlySolved = await getRecentlySolved();
                const tagsData = await getTopTags();
                const activityData = await getActivity(from, to);

                setProfileData(myDetails);
                setQuestions(recentlySolved);
                setTopTags(tagsData);
                setGraphData(activityData);

                if (myDetails.nickname) {
                    setNickname(myDetails.nickname);
                }

            } catch (err) {
                console.error("プロフィールデータの取得に失敗しました:", err);
            }
        };
        fetchProfileData();
    }, [user?.id]);

    // ─── 💡 画像アップロード処理 (Multerの 'icon' キーと完全連動) ───
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user?.id) return;

        const files = e.target.files;
        if (!files || files.length === 0) return;

        const selectedFile = files[0];
        if (!selectedFile.type.startsWith("image/")) {
            return;
        }

        try {
            const response = await updateProfileIcon(selectedFile);
            // 成功したら Context とローカルの profileData の両方を更新
            setUser((prev) => prev ? { ...prev, iconUrl: response.profile_icon_url } : null);
            setProfileData((prev) => prev ? { ...prev, iconUrl: response.profile_icon_url } : null);
            toast.success('プロフィールを更新しました。');
        } catch (err) {
            console.error("画像のアップロードに失敗しました:", err);
        } finally {
            e.target.value = ""; // 同じファイルを連続選択できるようにリセット
        }
    };

    // ─── 💡 ニックネーム更新処理 (Enterで発火) ───
    const handleNicknameChange = async () => {
        if (!nickname.trim()) {
            return;
        }
        try {
            await authService.updateNickname(nickname);
            setUser((prev) => prev ? { ...prev, nickname: nickname } : null);
            setProfileData((prev) => prev ? { ...prev, nickname: nickname } : null);
            setIsEditing(false); // 編集モード終了
        } catch (err) {
            console.error("ニックネームの更新に失敗しました:", err);
        }
    };

    // ニックネーム入力中のキー判定 (Enterで保存 / Escでキャンセル)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleNicknameChange();
        }
        if (e.key === "Escape") {
            setNickname(profileData?.nickname || user?.nickname || "");
            setIsEditing(false);
        }
    };

    // ─── 💡 グラフ用の計算 ───
    const maxCount = Math.max(...graphData.map((d) => d.count), 0);
    const ceilMax = maxCount === 0 ? 15 : Math.ceil(maxCount / 5) * 5;
    const yTicks = Array.from({ length: 6 }, (_, i) => (ceilMax / 5) * i);

    const maxTagCount = Math.max(...topTags.map((tag) => tag.count), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 px-[var(--spacing-64)] py-[var(--spacing-32)] h-[calc(100vh-64px)] overflow-y-auto bg-[#FAF9F5]">

            {/* ─── 1. プロフィールカード ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-1">
                <SectionTitle title="プロフィール" />

                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 min-h-[120px]">
                    <div className="relative w-full max-w-[140px] aspect-square text-[var(--main-color)] flex items-center justify-center rounded-full border">
                        <Avatar src={profileData?.iconUrl || user?.iconUrl || "/images/default-avatar.png"} className="w-full h-full" />
                        <label className=" transition-all hover:text-[var(--main-color)] hover:border-[var(--main-color)] hover:scale-110 absolute bottom-0 right-0 w-7 h-7 bg-white text-[var(--dark-gray)] border border-[var(--dark-gray)] rounded-full flex items-center justify-center cursor-pointer">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <CameraAltIcon className="!text-[16px] pointer-events-none " />
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                maxLength={20}
                                className="border border-[var(--dark-gray)] rounded px-2 py-0.5 text-[length:var(--font-size-normal)] focus:outline-none focus:border-[var(--main-color)] bg-white text-black"
                            />
                        ) : (
                            <>
                                <span>{nickname || "未設定"}</span>
                                <span
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center justify-center text-[var(--dark-gray)] hover:text-[var(--main-color)] transition-all  hover:scale-130 cursor-pointer"
                                >
                                    {/* 💡 アイコン自体は形とサイズだけを担当させ、ホバーやアニメーションは外側の器に任せる */}
                                    <EditIcon className="!text-[length:var(--font-size-normal)] pointer-events-none" />
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* 実績数値グリッド */}
                <div className="grid grid-cols-2 gap-4 shrink-0 pb-4">
                    {[
                        { label: "回答投稿数", value: profileData?.answerCount ?? 0 },
                        { label: "ベストアンサー数", value: profileData?.bestAnswerCount ?? 0 },
                        { label: "いいね獲得数", value: profileData?.totalLikeCount ?? 0 },
                        { label: "質問数", value: profileData?.questionCount ?? 0 },
                    ].map((item, i) => (
                        <div key={i} className="border border-[var(--light-gray)] bg-white rounded-[16px] flex flex-col gap-2 items-center justify-center min-h-[100px]">
                            <span>{item.value}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ─── 2. 最近解決した質問 ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-2">
                <SectionTitle title="最近解決した質問" />
                <div className="flex flex-col gap-2 px-4">
                    {questions.length === 0 ? (
                        <p className="text-sm text-[var(--dark-gray)] text-center py-4">最近解決した質問はありません</p>
                    ) : (
                        questions.map((question) => (
                            <QuestionCard key={question.id} isProfile question={question} />
                        ))
                    )}
                </div>
            </Card>

            {/* ─── 3. よく回答しているタグ ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-3">
                <SectionTitle title="よく回答しているタグ" />
                <div className={`flex-1 flex flex-col ${topTags.length === 4 ? "justify-between" : "gap-5"} min-h-[150px]`}>
                    {topTags.length === 0 ? (
                        <p className="text-sm text-[var(--dark-gray)] text-center py-4 m-auto">データがありません</p>
                    ) : (
                        topTags.map((tag, index) => {

                            const percentage = maxTagCount > 0 ? (tag.count / maxTagCount) * 100 : 0;

                            return (

                                <div key={index} className="flex flex-col gap-2 p-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{tag.name}</span>
                                        <span className="text-[var(--dark-gray)]">{tag.count}件</span>
                                    </div>
                                    <ProgressBar percentage={percentage} />
                                </div>
                            )
                        })
                    )}
                </div>
            </Card>

            {/* ─── 4. 活動推移グラフ ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-4">
                <SectionTitle title="活動推移" />

                {/* 💡 Recharts潰れ警告対策： min-h-[256px] を追加 */}
                <div className="w-full h-64 min-h-[256px] mt-4 select-none [&_.recharts-wrapper]:focus:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={graphData}
                            margin={{ top: 10, right: 5, left: 25, bottom: 5 }}
                        >
                            <CartesianGrid vertical={false} stroke="#F3F4F6" />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={[0, ceilMax]}
                                ticks={yTicks}
                                tickFormatter={(value) => `${value}件`}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                width={50}
                            />

                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                                formatter={(value) => [`${value}件`, '月間総回答数']}
                            />

                            <Legend
                                align="left"
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={12}
                                wrapperStyle={{ paddingLeft: 16 }}
                                formatter={() => <span className="inline-block align-middle text-[var(--text-color-black)] text-xs">
                                    月間総回答数 (件)
                                </span>}
                            />

                            <Bar
                                dataKey="count"
                                fill="var(--main-color)"
                                maxBarSize={44}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

        </div>
    );
}