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

import { getQuestions } from "@/api/questionService";
import { useMasterData } from "@/contexts/MasterDataContext";
import type { QuestionType } from "@/types/question";
import { DROP_DOWN_OPTIONS, MY_ACTIONS } from "@/constants/Filter"
import Loading from "@/components/common/Loading";
import { useLoading } from "@/contexts/LoadingContext";

export default function Top() {
    const navigate = useNavigate();
    const { isLoading } = useLoading()

    // --- ステート定義 ---
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const { statuses, tags } = useMasterData();
    const [currentSortOption, setCurrentSortOption] = useState<"newDesc" | "newAsc" | "likesDesc" | "likesAsc">(
        DROP_DOWN_OPTIONS[0].value as "newDesc" | "newAsc" | "likesDesc" | "likesAsc"
    );
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1)

    // フィルター・検索用
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedMyActionIds, setSelectedMyActionIds] = useState<('my_questions' | 'my_answers' | 'my_solved' | 'bookmarked')[]>([]);
    const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const [searchWord, setSearchWord] = useState(""); // 入力中の文字列
    const [activeKeyword, setActiveKeyword] = useState("");

    const handleFilterClear = () => {
        setSelectedMyActionIds([])
        setSelectedStatusIds([])
        setSelectedTagIds([])
        setSearchWord("")
    }

    // 💡 修正: どんなリテラル型の配列ステートでも安全にトグルできるように型を抽象化
    const handleToggleId = <T extends string>(id: string, setIds: React.Dispatch<React.SetStateAction<T[]>>) => {
        setIds((prev) =>
            (prev as string[]).includes(id)
                ? (prev as string[]).filter((item) => item !== id) as T[]
                : [...prev, id as T]
        );
        setCurrentPage(1);
    };

    // 💡 ステータス名から背景色を返すヘルパー関数
    const getStatusBgClass = (name: string) => {
        if (name === "回答募集中") return "bg-[var(--status-color-taking)]";
        if (name === "整理中") return "bg-[var(--status-color-organize)]";
        if (name === "解決済み") return "bg-[var(--status-color-resolved)]";
        return "bg-[var(--main-color)]"; // 予備の色
    };

    const pageChange = (nextPage: number) => {
        setCurrentPage(nextPage);
    };

    //  ソート順が変更された時のハンドラー
    const handleSortChange = (newSortValue: string) => {
        // DropdownMenuから渡ってくる string を、安全にステートの型へとキャストします
        setCurrentSortOption(newSortValue as "newDesc" | "newAsc" | "likesDesc" | "likesAsc");
        setCurrentPage(1);
    };

    //  キーワード検索が実行された時のハンドラー
    const handleSearch = () => {
        setActiveKeyword(searchWord); // 確定キーワードを更新してAPIをトリガー
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchQuestionsData = async () => {
            try {

                // APIリクエストの送信（ページ、ソート、キーワード、選択された各フィルターを連動）
                const response = await getQuestions({
                    currentPage: currentPage,
                    order: currentSortOption,
                    keyword: activeKeyword || undefined, // 空文字ならパラメーターを送らない
                    statusIds: selectedStatusIds.length > 0 ? selectedStatusIds : undefined,
                    tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
                    myActions: selectedMyActionIds.length > 0 ? selectedMyActionIds : undefined,
                });
                setMaxPage(response.totalPages)
                setQuestions(response.data);
            } catch (err: any) {
                console.error('質問の取得に失敗しました:', err);
            }
        };

        fetchQuestionsData();
    }, [currentPage, currentSortOption, activeKeyword, selectedStatusIds, selectedTagIds, selectedMyActionIds]);

    return (
        <div className="px-[var(--spacing-64)] h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex justify-center m-[var(--spacing-64)]">
                <Button text="質問作成" onClick={() => navigate("/create-question")} />
            </div>
            <Card className="flex flex-col cursor-pointer" onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target === e.currentTarget) {
                    setIsFilterOpen(true);
                }
            }}>
                <div className={`flex items-center justify-between border-b transition-all ${isFilterOpen ? "border-[var(--main-color)] mb-[var(--spacing16)]" : "border-transparent mb-0"}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <div className="flex items-center">
                        <FilterAltOutlinedIcon className="text-[var(--main-color)]" />
                        <p className="text-[length:var(--font-size-big)]">フィルター</p>
                    </div>
                    <div className="cursor-pointer !text-[var(--dark-gray)] text-[length:var(--font-size-normal)]" >
                        {isFilterOpen ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
                    </div>
                </div>
                <div className={`pl-[var(--spacing-16)] grid transition-all ${isFilterOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} overflow-hidden`}>
                    <div className="min-h-0 flex flex-col gap-4 pb-[1px]">
                        {/* マイアクション */}
                        <div className="flex flex-col gap-2">
                            <div className="py-[var(--spacing-8)]">
                                <div className="border-b border-[var(--light-gray)] py-[var(--spacing-8)] flex flex-row justify-between items-end">
                                    <p>マイアクション</p>
                                    <button className="px-4 py-1 rounded-[4px] text-white bg-[var(--main-color)] shadow-[var(--box-shadow)] hover:shadow-[var(--hover-box-shadow)] transition-all duration-200 cursor-pointer active:shadow-none" onClick={() => handleFilterClear()}>条件クリア</button>
                                </div>
                            </div>
                            <div className="flex gap-2 px-2 flex-wrap">
                                {MY_ACTIONS.map((myAction) => (
                                    <FilterChip
                                        key={myAction.id}
                                        id={myAction.id}
                                        name={myAction.name}
                                        isSelected={selectedMyActionIds.includes(myAction.id)}
                                        onToggle={(id) => handleToggleId(id, setSelectedMyActionIds)}
                                        className="h-[36px] bg-[var(--main-color)]"
                                    />
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
                            <div className="flex gap-2 px-2 flex-wrap">
                                {statuses?.map((status) => (
                                    <FilterChip
                                        key={status.id}
                                        id={status.id}
                                        name={status.name}
                                        isSelected={selectedStatusIds.includes(status.id)}
                                        onToggle={(id) => handleToggleId(id, setSelectedStatusIds)}
                                        // 💡 id === 1 ではなく、name で背景色を安全に出し分け
                                        className={`h-[36px] ${getStatusBgClass(status.name)}`}
                                    />
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
                                {tags?.map((tag) => (
                                    <FilterChip
                                        key={tag.id}
                                        id={tag.id}
                                        name={tag.name}
                                        isSelected={selectedTagIds.includes(tag.id)}
                                        onToggle={(id) => handleToggleId(id, setSelectedTagIds)}
                                        className="font-['Lora'] h-[27px] bg-[var(--main-color)]"
                                    />
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
                                <TextInput placeholder="検索ワードを入力してください" value={searchWord} onChange={setSearchWord} onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }} />
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
                   {isLoading ? <Loading /> : questions.length === 0 ? (
                    <p className="text-sm text-[var(--dark-gray)] text-center py-4">一致する質問はありません</p>
                    ) : (
                        questions.map((question) => (
                            <QuestionCard key={question.id} question={question} />
                        ))
                    )}
                </div>
            </ScrollBar>
            <Pagination current={currentPage} max={maxPage} onPageChange={pageChange} />
        </div>
    );
}
