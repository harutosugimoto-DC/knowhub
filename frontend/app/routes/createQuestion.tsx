import Button from "@/components/common/Button";
import SectionTitle from "@/components/common/SectionTitle";
import TextInput from "@/components/common/TextInput";
import TagSelector from "@/components/createQuestion/TagSelector";
import { useEffect, useRef, useState } from "react";
import StatusChip from "@/components/common/StatusChip";
import Card from "@/components/common/Card";
import TagChip from "@/components/common/TagChip";
import ScrollBar from "@/components/common/ScrollBar";
import TextArea from "@/components/common/Textarea";
import Modal from "@/components/common/Modal";

import { detailPlaceholder, titlePlaceholder } from "@/constants/placeholder";
import { supabase } from "@/lib/supabase";

import { LuBot } from "react-icons/lu";
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ErrorMessages from "@/components/common/ErrorMessages";
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

type Tag = { id: string; name: string };
type ChatMessage = { id: number; role: 'user' | 'model'; text: string };

export default function CreateQuestion() {
    const navigate = useNavigate();
    const [titleText, setTitleText] = useState("");
    const [detailText, setDetailText] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagLoadError, setTagLoadError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [aiInputText, setAiInputText] = useState("");
    const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([
        { id: 1, role: "model", text: "こんにちは！質問の作成をお手伝いします。どのような事でお困りですか？" },
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const aiScrollRef = useRef<HTMLDivElement>(null);

    const [errors, setErrors] = useState<{ title?: string; detail?: string; tags?: string }>({});

    // タグ一覧をバックエンドから取得
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const headers: Record<string, string> = {};
            if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

            return fetch(`${API_BASE}/api/v1/tags`, { headers });
        })
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: unknown) => {
                if (Array.isArray(data) && data.length > 0) {
                    setAllTags(data as Tag[]);
                } else if (Array.isArray(data) && data.length === 0) {
                    setTagLoadError('タグが0件です。Supabase の tags テーブルの RLS ポリシーを確認してください。');
                }
            })
            .catch((err: Error) => {
                console.error('タグ取得エラー:', err);
                setTagLoadError(`タグの取得に失敗しました。バックエンドが起動しているか確認してください。(${err.message})`);
            });
    }, []);

    // AIメッセージ追加時に末尾へスクロール
    useEffect(() => {
        aiScrollRef.current?.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [aiChatMessages]);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!titleText.trim()) {
            newErrors.title = "質問タイトルを入力してください。";
        } else if (titleText.length > 40) {
            newErrors.title = "タイトルは40文字以内で入力してください。";
        }

        if (!detailText.trim()) {
            newErrors.detail = "詳細内容を入力してください。";
        } else if (detailText.length > 5000) {
            newErrors.detail = "詳細は5000文字以内で入力してください。";
        }

        if (selectedTagIds.length === 0) {
            newErrors.tags = "タグを1つ以上選択してください。";
        } else if (selectedTagIds.length > 5) {
            newErrors.tags = "タグは最大5つまでしか選択できません。";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitQuestion = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setSubmitError('ログインが必要です');
                setIsSubmitting(false);
                return;
            }

            const res = await fetch(`${API_BASE}/api/v1/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    title: titleText,
                    content: detailText,
                    tag_ids: selectedTagIds,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setSubmitError((body as { error?: string }).error ?? '投稿に失敗しました');
                setIsSubmitting(false);
                return;
            }

            navigate('/top');
        } catch (err) {
            console.error('質問投稿エラー:', err);
            setSubmitError('ネットワークエラーが発生しました');
            setIsSubmitting(false);
        }
    };

    const AI_INPUT_MAX = 2000;

    const submitAiChat = async () => {
        const text = aiInputText.trim();
        if (!text || isAiLoading) return;
        if (text.length > AI_INPUT_MAX) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userMsg: ChatMessage = { id: Date.now(), role: 'user', text };
        const nextMessages = [...aiChatMessages, userMsg];
        setAiChatMessages(nextMessages);
        setAiInputText('');
        setIsAiLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/v1/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
                }),
            });

            if (res.ok) {
                const data = await res.json() as { text: string };
                setAiChatMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, role: 'model', text: data.text },
                ]);
            } else {
                setAiChatMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, role: 'model', text: 'AIの応答に失敗しました。もう一度お試しください。' },
                ]);
            }
        } catch {
            setAiChatMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: 'model', text: 'ネットワークエラーが発生しました。' },
            ]);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="flex justify-center gap-4 overflow-x-hidden h-[calc(100vh-64px)]">
            <ScrollBar className={`mr-1 flex-1 h-full overflow-y-auto flex flex-col gap-4 px-[var(--spacing-64)] py-[var(--spacing-32)] transition-all `}>
                <div>
                    <div className="py-[var(--spacing-16)]">
                        <SectionTitle title="質問タイトル" isRequired>
                            <button onClick={() => setIsAiOpen(!isAiOpen)} className="transition-all hover:shadow-[var(--hover-box-shadow)] shadow-[var(--box-shadow)] cursor-pointer rounded-[16px] text-white bg-[image:var(--ai-color)] px-[var(--spacing-32)] py-[var(--spacing-16)]">
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
                        {tagLoadError
                            ? <ErrorMessages message={tagLoadError} />
                            : <TagSelector selectedTagIds={selectedTagIds} setSelectedTagIds={setSelectedTagIds} allTagData={allTags} />
                        }
                        {errors.tags && <ErrorMessages message={errors.tags} />}
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <Button text="内容確認" onClick={() => { if (validate()) setIsModalOpen(true); }} />
                </div>
            </ScrollBar>

            {/* 右側：AIサポートアシスタント */}
            <div className={`${isAiOpen ? "flex-1" : "flex-0"} transition-all h-full flex flex-col rounded-l-[16px] shadow-[-4px_0px_4px_rgba(0,0,0,0.25)] overflow-hidden`}>
                <div className="flex justify-between items-center bg-[image:var(--ai-color)] text-white p-2 shrink-0">
                    <div className="flex items-center gap-2 h-[40px] text-[length:var(--font-size-big)]">
                        <div className="h-full w-[40px] flex items-center justify-center">
                            <LuBot />
                        </div>
                        <p>AI サポートアシスタント</p>
                    </div>
                    <div className="transition-all hover:text-[var(--dark-gray)]">
                        <CloseIcon className="cursor-pointer " onClick={() => setIsAiOpen(false)} />

                    </div>
                </div>

                {/* メッセージエリア */}
                <ScrollBar className="flex-1 my-4 mr-2 bg-[var(--base-color)]" isAi ref={aiScrollRef}>
                    <div className="flex flex-col gap-6 p-4">
                        {aiChatMessages.map((msg) => {
                            const isAi = msg.role === "model";
                            return (
                                <div key={msg.id} className={`flex w-full ${isAi ? "justify-start" : "justify-end"}`}>
                                    <div className={`!select-text max-w-[80%] p-3 text-sm leading-relaxed whitespace-pre-wrap rounded-lg shadow-sm border ${isAi ? "bg-[#FDF3E7] border-[#FFEBD0] text-[#444]" : "bg-white border-gray-200 text-[#333]"}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        {isAiLoading && (
                            <div className="flex w-full justify-start">
                                <div className="max-w-[80%] p-3 text-sm leading-relaxed rounded-lg shadow-sm border bg-[#FDF3E7] border-[#FFEBD0] text-[#aaa]">
                                    入力中...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollBar>

                {/* 入力エリア */}
                <div className="px-4 pt-3 pb-4 border-t border-[var(--light-gray)] bg-white flex flex-col gap-1">
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={aiInputText}
                            onChange={(e) => setAiInputText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAiChat(); } }}
                            placeholder="質問したい内容を入力..."
                            maxLength={AI_INPUT_MAX}
                            rows={1}
                            className={`px-[var(--spacing-16)] py-[10px] flex-1 min-h-[44px] max-h-[160px] border rounded-[16px] focus:outline-none resize-none overflow-y-auto ${aiInputText.length > AI_INPUT_MAX ? 'border-[var(--danger-color)]' : 'border-[var(--light-gray)] focus:border-[#FF9500]'}`}
                            disabled={isAiLoading}
                            style={{ fieldSizing: 'content' } as React.CSSProperties}
                        />
                        <button onClick={() => submitAiChat()} disabled={isAiLoading || aiInputText.trim().length === 0 || aiInputText.length > AI_INPUT_MAX} className="w-[44px] h-[44px] rounded-full bg-[image:var(--ai-color)] text-white flex items-center justify-center cursor-pointer disabled:opacity-50">
                            <ArrowUpwardIcon className="!text-[16px]" />
                        </button>
                    </div>
                    <p className={`text-xs text-right pr-14 ${aiInputText.length > AI_INPUT_MAX ? 'text-[var(--danger-color)]' : 'text-[var(--dark-gray)]'}`}>
                        {aiInputText.length} / {AI_INPUT_MAX}
                    </p>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <Card className="max-w-[1000px] min-w-[400px]">
                        <div className="flex items-center justify-between py-[var(--spacing-16)]">
                            <div className="flex items-center gap-4">
                                <StatusChip name="回答募集中" />
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
                                {selectedTagIds.map((tagId, index) => (
                                    <TagChip key={index} text={allTags.find((t) => t.id === tagId)?.name ?? tagId} />
                                ))}
                            </div>
                        </div>
                        {submitError && (
                            <div className="px-[var(--spacing-16)] py-[var(--spacing-8)]">
                                <ErrorMessages message={submitError} />
                            </div>
                        )}
                    </Card>
                    <Button
                        onClick={() => submitQuestion()}
                        text={isSubmitting ? "投稿中..." : "質問投稿"}
                    />
                </Modal>
            )}
        </div>
    );
}
