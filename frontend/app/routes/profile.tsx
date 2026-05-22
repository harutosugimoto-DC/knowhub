import Card from "@/components/common/Card";
import SectionTitle from "@/components/common/SectionTitle";
import ProgressBar from "@/components/profile/ProgressBar"
import QuestionCard from "@/components/top/QuestionCard";
import Avatar from "@/components/common/Avatar";

import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { questionsMockData } from "@/mockData";

export default function Profile() {
    // よく回答しているタグのモックデータ
    const topTags = [
        { name: "Python", count: 93, percent: "w-[93%]" },
        { name: "リモートワーク", count: 79, percent: "w-[79%]" },
        { name: "JavaScript", count: 19, percent: "w-[19%]" },
        { name: "React", count: 9, percent: "w-[9%]" },
    ];

    // 活動推移グラフのモックデータ（h-[割合] で棒の高さを表現）
    const graphData = [
        { month: "11月", count: 4 },
        { month: "12月", count: 11 },
        { month: "1月", count: 9 },
        { month: "2月", count: 14 },
        { month: "3月", count: 2 },
        { month: "4月", count: 7 },
    ];
    const questions = questionsMockData.slice(1, 3)

    // 💡 1. データの中から count の最大値を取得（データが空の時のために下限を0にする）
    const maxCount = Math.max(...graphData.map((d) => d.count), 0);

    // 💡 2. 5等分してきれいに収まる上限の値を計算（5の倍数に切り上げ）
    // 例：最大が11件なら「15」、7件なら「10」、23件なら「25」になります（0件ならデフォルト15）
    const ceilMax = maxCount === 0 ? 15 : Math.ceil(maxCount / 5) * 5;

    // 💡 3. 0からceilMaxまでを5等分した目盛り用の配列を自動生成
    // 例：ceilMaxが15なら [0, 3, 6, 9, 12, 15] になります
    const yTicks = Array.from({ length: 6 }, (_, i) => (ceilMax / 5) * i);
    return (
        // 大元のGrid
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 px-[var(--spacing-64)] py-[var(--spacing-32)] h-[calc(100vh-64px)] overflow-y-auto bg-[#FAF9F5]">

            {/* ─── 1. プロフィールカード (PC: 1行目・左) ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-1">
                <SectionTitle title="プロフィール" />

                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2 min-h-[120px]">

                    <div className="relative w-full max-w-[140px] aspect-square text-[var(--main-color)] flex items-center justify-center rounded-full border">
                        <Avatar className="w-full h-full" />
                        <button className="absolute bottom-0 right-0 w-7 h-7 bg-white text-[var(--dark-gray)] border border-[var(--dark-gray)] rounded-full flex items-center justify-center cursor-pointer">
                            <CameraAltIcon className="!text-[16px]" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>ニックネーム</span>
                        <EditIcon className="!text-[length:var(--font-size-normal)] !text-[var(--dark-gray)] cursor-pointer" />
                    </div>
                </div>

                {/* 3. ★ 実績数値グリッド：shrink-0 を追加して、アバターに潰されないようにガード */}
                <div className="grid grid-cols-2 gap-4 shrink-0 pb-4">
                    {[
                        { label: "質問回答数", value: 26 },
                        { label: "ベストアンサー数", value: 3 },
                        { label: "いいね総数", value: 15 },
                        { label: "質問数", value: 8 },
                    ].map((item, i) => (
                        <div key={i} className="border border-[var(--light-gray)] bg-white rounded-[16px] flex flex-col gap-2 items-center justify-center min-h-[100px]">
                            <span>{item.value}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ─── 2. 最近解決した質問 (PC: 1行目・右) ─── */}
            {/* HTMLの記述順を「よく回答しているタグ」より前に持ってきて lg:order-2 を指定 */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-2">
                <SectionTitle title="最近解決した質問" />
                <div className="flex flex-col gap-2 px-4">
                    {questions.map((question) => (
                        <QuestionCard key={question.id} isProfile question={question} />
                    ))}
                </div>
            </Card>

            {/* ─── 3. よく回答しているタグ (PC: 2行目・左) ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-3">
                <SectionTitle title="よく回答しているタグ" />
                <div className="flex-1 flex flex-col justify-around">
                    {topTags.map((tag, index) => (
                        <div key={index} className="flex flex-col gap-2 p-1">
                            <div className="flex justify-between">
                                <span>{tag.name}</span>
                                <span className="text-[var(--dark-gray)]">{tag.count}件</span>
                            </div>
                            <ProgressBar percentage={tag.count} />
                        </div>
                    ))}
                </div>
            </Card>

            {/* ─── 4. 活動推移グラフ (PC: 2行目・右) ─── */}
            <Card className="px-4 pt-0 flex flex-col gap-4 lg:order-4">
                <SectionTitle title="活動推移" />

                <div className="w-full h-64 mt-4 select-none [&_.recharts-wrapper]:focus:outline-none">
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

                            {/* 💡 4. 計算した動的な値（ceilMax と yTicks）を割り当てる */}
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={[0, ceilMax]} // 動的な上限値を設定
                                ticks={yTicks}       // 動的な目盛り配列を設定
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
                                formatter={() => <span className="inline-block align-middle text-[var(--text-color-black)]">
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