import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import DropdownMenu from "@/components/common/DropdownMenu";
import ScrollBar from "@/components/common/ScrollBar";
import SectionTitle from "@/components/common/SectionTitle";
import QuestionCard from "@/components/top/QuestionCard";
import Pagination from "@/components/top/Pagination";
import TextInput from "@/components/common/TextInput";
import FilterChip from "@/components/top/FilterChip";

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';

//仮データ
import { myActionsMock } from "@/mockData";
import { getQuestions } from "@/api/questionService";
import { getStatuses } from "@/api/statusService"
import { getTags } from "@/api/tagService";
import type { QuestionType } from "@/types/question";

export default function Top() {
    const navigate = useNavigate();

    const DROP_DOWN_OPTIONS = [
        { label: "投稿日降順", value: "newDesc" },
        { label: "投稿日昇順", value: "newAsc" },
        { label: "いいね数降順", value: "likesDesc" },
        { label: "いいね数昇順", value: "likesAsc" }
    ];

    const MAX_PAGE = 5;

    // --- ステート定義 ---
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [statuses, setStatuses] = useState([])
    const [tags, setTags] = useState([])
    const [currentSortOption, setCurrentSortOption] = useState(DROP_DOWN_OPTIONS[0].value);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // フィルター・検索用
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedMyActionIds, setSelectedMyActionIds] = useState([1]);
    const [selectedStatusIds, setSelectedStatusIds] = useState([1]);
    const [selectedTagIds, setSelectedTagIds] = useState([1]);

    const [searchWord, setSearchWord] = useState(""); // 入力中の文字列
    const [activeKeyword, setActiveKeyword] = useState("");


    const pageChange = (nextPage: number) => {
        setCurrentPage(nextPage);
    };

    //  ソート順が変更された時のハンドラー
    const handleSortChange = (newSortValue: string) => {
        setCurrentSortOption(newSortValue);
        setCurrentPage(1);
    };

    //  キーワード検索が実行された時のハンドラー
    const handleSearch = () => {
        setActiveKeyword(searchWord); // 確定キーワードを更新してAPIをトリガー
        setCurrentPage(1);
    };

    useEffect(() => {

        const fetchStatuses = async () => {
            try {
                const response = await getStatuses()

                setStatuses(response);
            } catch (err: any) {
                console.error('ステータス一覧の取得に失敗しました:', err);
            }
        };

        const fetchTags = async () => {
            try {
                const response = await getTags()
                setTags(response);
            } catch (err: any) {
                console.error('タグ一覧の取得に失敗しました:', err);
            }
        };

        fetchStatuses()
        fetchTags()

    }, [])

    useEffect(() => {
        const fetchQuestionsData = async () => {
            try {
                // ドロップダウンの文字列をバックエンドの仕様 ('likes' または 'new') に変換
                const backendOrder = currentSortOption.startsWith('likes') ? 'likes' : 'new';

                // APIリクエストの送信（ページ、ソート、キーワードを連動）
                const response = await getQuestions({
                    page: currentPage,
                    order: backendOrder,
                    keyword: activeKeyword || undefined // 空文字ならパラメーターを送らない
                });

                setQuestions(response.data);
            } catch (err: any) {
                console.error('質問の取得に失敗しました:', err);
            }
        };

        fetchQuestionsData();
    }, [currentPage, currentSortOption, activeKeyword]);

    return (
        <div className="px-[var(--spacing-64)]">
            <div className="flex justify-center m-[var(--spacing-64)]">
                <Button text="質問作成" onClick={() => navigate("/create-question")} />
            </div>
            <Card className="flex flex-col">
                <div className={`flex items-center justify-between border-b transition-all ${isFilterOpen ? "border-[var(--main-color)] mb-[var(--spacing16)]" : "border-transparent mb-0"}`}>
                    <div className="flex items-center">
                        <FilterAltOutlinedIcon className="text-[var(--main-color)]" />
                        <p className="text-[length:var(--font-size-big)]">フィルター</p>
                    </div>
                    <div className="cursor-pointer !text-[var(--dark-gray)] text-[length:var(--font-size-normal)]" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        {isFilterOpen ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
                    </div>
                </div>
                <div className={`pl-[var(--spacing-16)] grid transition-all ${isFilterOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} overflow-hidden`}>
                    <div className="min-h-0 flex flex-col gap-4 pb-[1px]">
                        {/* マイアクション */}
                        <div className="flex flex-col gap-2">
                            <div className="py-[var(--spacing-8)]">
                                <div className="border-b border-[var(--light-gray)] py-[var(--spacing-8)]">
                                    <p>マイアクション</p>
                                </div>
                            </div>
                            <div className="flex gap-2 px-2">
                                {myActionsMock.map((myAction) => (
                                    <FilterChip key={myAction.id} id={myAction.id} name={myAction.name} setOnClick={setSelectedMyActionIds} className="h-[36px] bg-[var(--main-color)]" isSelected={selectedMyActionIds.includes(myAction.id)} />
                                ))}
                            </div>
                        </div>
                        {/* ステータス */}
                        <div className="flex flex-col gap-2 wrap">
                            <div className="py-[var(--spacing-8)]">
                                <div className="border-b border-[var(--light-gray)] py-[var(--spacing-8)]">
                                    <p>ステータス</p>
                                </div>
                            </div>
                            <div className="flex gap-2 px-2">
                                {statuses.map((status) => (
                                    <FilterChip key={status.id} id={status.id} name={status.name} setOnClick={setSelectedStatusIds} className={` ${status.id === 1 ? "bg-[var(--status-color-taking)]" : status.id === 2 ? "bg-[var(--status-color-organize)]" : "bg-[var(--status-color-resolved)]"} h-[36px] `} isSelected={selectedStatusIds.includes(status.id)} />
                                ))}
                            </div>
                        </div>
                        {/* タグ */}
                        <div className="flex flex-col gap-2">
                            <div className="py-[var(--spacing-8)]">
                                <div className="border-b border-[var(--light-gray)] py-[var(--spacing-8)]">
                                    <p>タグ</p>
                                </div>
                            </div>
                            <div className="flex gap-2 px-2 flex-wrap">
                                {tags.map((tags) => (
                                    <FilterChip key={tags.id} id={tags.id} name={tags.name} setOnClick={setSelectedTagIds} className="font-['Lora'] h-[27px] bg-[var(--main-color)]" isSelected={selectedTagIds.includes(tags.id)} />
                                ))}
                            </div>
                        </div>
                        {/* キーワード */}
                        <div className="flex flex-col gap-2">
                            <div className="py-[var(--spacing-8)]">
                                <div className="border-b border-[var(--light-gray)] py-[var(--spacing-8)]">
                                    <p>キーワード</p>
                                </div>
                            </div>
                            <div className="flex gap-2 px-2 relative">
                                <TextInput placeholder="検索ワードを入力してください" value={searchWord} onChange={setSearchWord} />
                                <div onClick={handleSearch} className="rounded-full p-1 cursor-pointer bg-[var(--main-color)] absolute flex justify-center items-center top-[50%] right-[var(--spacing-16)] -translate-x-1/2 -translate-y-1/2">
                                    <SearchOutlinedIcon className="!text-[length:var(--font-size-normal)] text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <div className="py-[var(--spacing-16)]">
                <SectionTitle title="質問一覧">
                    <DropdownMenu options={DROP_DOWN_OPTIONS} onChange={handleSortChange} value={currentSortOption} />
                </SectionTitle>
            </div>
            <ScrollBar className="w-full max-h-[1000px]">
                <div className="flex flex-col gap-2 px-[var(--spacing-16)] pb-[var(--spacing-8)]">
                    {questions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                    ))}
                </div>
            </ScrollBar>
            <Pagination current={currentPage} max={MAX_PAGE} onPageChange={pageChange} />
        </div>
    );
}