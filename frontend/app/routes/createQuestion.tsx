import Button from "@/components/common/Button";
import SectionTitle from "@/components/common/SectionTitle";
import TextInput from "@/components/common/TextInput";
import TagSelector from "@/components/createQuestion/TagSelector";
import { useState } from "react";
import StatusChip from "@/components/common/StatusChip";
import Card from "@/components/common/Card";
import TagChip from "@/components/common/TagChip";
import ScrollBar from "@/components/common/ScrollBar";
import TextArea from "@/components/common/Textarea";
import Modal from "@/components/common/Modal";

import { tagsMock } from "@/mockData";
import { detailPlaceholder, titlePlaceholder } from "@/constants/placeholder";

import { LuBot } from "react-icons/lu";
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // 送信ボタン用
import ErrorMessages from "@/components/common/ErrorMessages";
import { useNavigate } from "react-router";

// チャットメッセージのモックデータ
const chatMessagesMock = [
    { id: 1, sender: "ai", text: "こんにちは！質問の作成をお手伝いします。どのような事でお困りですか？" },
    { id: 2, sender: "user", text: "OOOOOaaaaa" },
    { id: 3, sender: "ai", text: "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ" },
    { id: 4, sender: "user", text: "OOOOOaaaaa" },
    { id: 5, sender: "ai", text: "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ" },
    { id: 6, sender: "user", text: "OOOOOaaaaa" },
];

export default function CreateQuestion() {

    const navigate = useNavigate()
    const [titleText, setTitleText] = useState("")
    const [detailText, setDetailText] = useState("")
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAiOpen, setIsAiOpen] = useState(false)

    const [aiInputText, setAiInputText] = useState("");
    const [aiChatMessages, setAiChatMessages] = useState(chatMessagesMock)
    const [errors, setErrors] = useState<{ title?: string; detail?: string; tags?: string }>({});

    const submitAiChat = () => {
        //ここにai用apiへaiInputTextを送信する処理を記載
        //その後setAiChatMessagesでchatに追加
    }
    const validate = () => {
        const newErrors: typeof errors = {};

        // 1. タイトルのチェック
        if (!titleText.trim()) {
            newErrors.title = "質問タイトルを入力してください。";
        } else if (titleText.length > 100) {
            newErrors.title = "タイトルは100文字以内で入力してください。";
        }

        // 2. 詳細のチェック
        if (!detailText.trim()) {
            newErrors.detail = "詳細内容を入力してください。";
        }

        // 3. タグ付けのチェック
        if (selectedTagIds.length === 0) {
            newErrors.tags = "タグを1つ以上選択してください。";
        } else if (selectedTagIds.length > 5) {
            newErrors.tags = "タグは最大5つまでしか選択できません。";
        }

        setErrors(newErrors);

        // エラーが1つもなければ true を返す
        return Object.keys(newErrors).length === 0;
    };
    const submitQuestion = () => {
        navigate("/top")
    }
    return (
        <div className="flex justify-center gap-4 overflow-x-hidden h-[calc(100vh-64px)]">
            <ScrollBar className={`mr-1 flex-1 h-full overflow-y-auto flex flex-col gap-4 px-[var(--spacing-64)] py-[var(--spacing-32)] transition-all `}>
                <div>
                    <div className="py-[var(--spacing-16)]">
                        <SectionTitle title="質問タイトル" isRequired>
                            <button onClick={() => setIsAiOpen(!isAiOpen)} className="shadow-[var(--box-shadow)] cursor-pointer rounded-[16px] text-white bg-[image:var(--ai-color)] px-[var(--spacing-32)] py-[var(--spacing-16)]">
                                AIに相談する
                            </button>
                        </SectionTitle>
                    </div>
                    <div className="flex flex-col gap-4 px-[var(--spacing-16)] ">
                        <TextInput value={titleText} onChange={setTitleText} placeholder={titlePlaceholder} />
                        {errors.title && <ErrorMessages message={errors.title} />}
                    </div>
                </div>
                <div>
                    <div className="py-[var(--spacing-16)]">
                        <SectionTitle title="詳細" isRequired />
                    </div>
                    <div className="flex flex-col gap-4 px-[var(--spacing-16)]">
                        <TextArea value={detailText} onChange={setDetailText} placeholder={detailPlaceholder} />
                        {errors.detail && <ErrorMessages message={errors.detail} />}
                    </div>
                </div>
                <div className="relative">
                    <div className="py-[var(--spacing-16)]">

                        <SectionTitle title="タグ付け" isRequired isTagSelect />
                    </div>
                    <div className="flex flex-col gap-4 px-[var(--spacing-16)]">
                        <TagSelector selectedTagIds={selectedTagIds} setSelectedTagIds={setSelectedTagIds} allTagData={tagsMock} />
                        {errors.tags && <ErrorMessages message={errors.tags} />}
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <Button text="内容確認" onClick={() => { if (validate()) setIsModalOpen(true) }} />
                </div>
            </ScrollBar >

            {/* 右側：AIサポートアシスタント*/}
            <div className={`${isAiOpen ? "flex-1" : "flex-0"} transition-all  h-full flex flex-col rounded-l-[16px] shadow-[-4px_0px_4px_rgba(0,0,0,0.25)] overflow-hidden`
            }>
                <div className="flex justify-between items-center bg-[image:var(--ai-color)] text-white p-2 shrink-0">
                    <div className="flex items-center gap-2 h-[40px] text-[length:var(--font-size-big)]">
                        <div className="h-full w-[40px] flex items-center justify-center">
                            <LuBot />
                        </div>
                        <p>AI サポートアシスタント</p>
                    </div>
                    <CloseIcon className="cursor-pointer" onClick={() => setIsAiOpen(false)} />
                </div>

                {/* メッセージエリア */}
                <ScrollBar className="flex-1 my-4 mr-2 bg-[var(--base-color)] " isAi>
                    <div className="flex flex-col gap-6 p-4">
                        {aiChatMessages.map((msg) => {
                            const isAi = msg.sender === "ai";
                            return (
                                <div key={msg.id} className={`flex w-full ${isAi ? "justify-start" : "justify-end"}`}>
                                    <div className={`max-w-[80%] p-3 text-sm leading-relaxed whitespace-pre-wrap rounded-lg shadow-sm border ${isAi ? "bg-[#FDF3E7] border-[#FFEBD0] text-[#444]" : "bg-white border-gray-200 text-[#333]"}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollBar>

                {/* 入力エリア */}
                <div className="p-4 border-t border-[var(--light-gray)] bg-white gap-2 flex justify-center items-center">
                    <input
                        type="text"
                        value={aiInputText}
                        onChange={(e) => setAiInputText(e.target.value)}
                        placeholder="質問したい内容を入力..."
                        className="px-[var(--spacing-16)] flex-1 h-[44px] border border-[var(--light-gray)] rounded-[16px] focus:border-[#FF9500]"
                    />
                    {/* 送信ボタン */}
                    <button onClick={() => submitAiChat()} className="w-[44px] h-[44px] rounded-full bg-[image:var(--ai-color)] text-white flex items-center justify-center cursor-pointer">
                        <ArrowUpwardIcon className="!text-[16px]" />
                    </button>
                </div>
            </div >
            {
                isModalOpen &&
                <Modal onClose={() => setIsModalOpen(false)}>
                    <Card className="max-w-[1000px] min-w-[400px]">
                        <div className="flex items-center justify-between py-[var(--spacing-16)]">
                            <div className="flex items-center gap-4">
                                <StatusChip id={1} />
                                <h2 className="text-[length:var(--font-size-big)]">
                                    {titleText}
                                </h2>
                            </div>
                        </div>

                        <div className="px-[var(--spacing-16)] py-[var(--spacing-8)]">
                            <ScrollBar className="max-h-[300px]">
                                <p className="whitespace-pre-wrap break-words">{detailText}</p>
                            </ScrollBar>
                        </div>
                        <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {selectedTagIds?.map((tagId, index) => (
                                    <TagChip key={index} text={tagsMock.find((tag) => tag.id === tagId)?.name ?? "not found"} />
                                ))}
                            </div>
                        </div>
                    </Card>
                    <Button onClick={() => submitQuestion()} text="質問投稿"></Button>
                </Modal>
            }
        </div >
    );
}