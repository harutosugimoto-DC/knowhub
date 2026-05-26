import { useState } from "react";
import Avatar from "../common/Avatar";
import CardActionMenu from "../common/CardActionMenu";
import CollapsibleContent from "../common/CollapsibleContent";
import Like from "../common/Like";
import Time from "../common/Time";

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';

// ─────────────────────────────────────────
// 返信データの型定義
// replies を再帰的に持つことで「返信の中の返信」に対応しています
// ─────────────────────────────────────────
type ReplyData = {
    id: number;
    userName: string;
    content: string;
    postingTime: Date;
    likeCount: number;
    isLiked: boolean;
    replies?: ReplyData[];
};

type ThreadReplyProps = {
    userName: string;
    content: string;
    postingTime: Date;
    likeCount: number;
    isLiked: boolean;
    replies?: ReplyData[];
    // 現在の返信の深さ（何段目か）
    // 省略時は 0（1段目）として扱います
    depth?: number;
    // 返信ボタンが押されたときに親コンポーネントへ通知するコールバック
    // プレビュー表示に必要な情報（ユーザー名・本文・投稿時刻）を渡す
    // ? は「渡さなくてもよい（省略可能）」を意味する（オプショナルprops）
    onReply?: (preview: { userName: string; content: string; postingTime: Date }) => void;
};

// ─────────────────────────────────────────
// 返信ボタンを表示する最大の深さ
//
// depth がこの値以上になると「返信」ボタンを非表示にします。
// 現在の設定：3段目（depth === 2）以降は返信ボタンなし
//
// この定数を変更するだけでネスト制限を調整できます。
// 例：MAX_REPLY_DEPTH = 3 にすると4段目以降で非表示になります。
// ─────────────────────────────────────────
const MAX_REPLY_DEPTH = 3;

export default function ThreadReply({
    userName,
    content,
    postingTime,
    likeCount,
    isLiked,
    replies,
    depth = 0, // 省略時は 0（1段目）
    onReply,   // 返信ボタンが押されたときに親へ通知するコールバック
}: ThreadReplyProps) {
    // 返信一覧の表示 / 非表示

    const [isReplyOpen, setIsReplyOpen] = useState(false);
    // 本文の展開 / 折りたたみ
    const [isContentOpen, setIsContentOpen] = useState(false);
    // テキストが3行を超えているか（CardActionMenu の矢印アイコン制御に使用）
    const [isOverflowing, setIsOverflowing] = useState(false);

    // 件数は replies.length で取得（replies が undefined のときは 0）
    const replyCount = replies?.length ?? 0;

    // 返信ボタンを表示するか
    // depth が MAX_REPLY_DEPTH（2）未満のときのみ表示します
    // depth 0（1段目）→ true（表示）
    // depth 1（2段目）→ true（表示）
    // depth 2（3段目）→ false（非表示）
    const canReply = depth < MAX_REPLY_DEPTH;


    return (
        <div className="flex">
            <div className="pr-[var(--spacing-16)] flex justify-top items-start">
                <SubdirectoryArrowRightOutlinedIcon className="text-[var(--dark-gray)]" />
                <div className="w-[3px] h-full bg-[var(--main-color)] opacity-[0.5]"></div>
            </div>
            <div className="flex flex-col gap-2 p-4 flex-1 rounded-[4px]
             border border-[var(--light-gray)] bg-[var(--light-gray)]/15">

                {/* ── ヘッダー：アバター / ニックネーム / 時刻 / メニュー ── */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 py-[4px]">
                        <Avatar src={iconURL} className="w-[32px] h-[32px]" />
                        <p>{userName}</p>
                        <Time postingTime={postingTime} />
                    </div>
                    <CardActionMenu
                        isContentOpen={isContentOpen}
                        setIsContentOpen={setIsContentOpen}
                        onRemove={() => { }}
                        isOverflowing={isOverflowing}
                    />
                </div>

                {/* ── 返信本文（3行を超えると折りたたまれる） ── */}
                <CollapsibleContent
                    content={content}
                    isContentOpen={isContentOpen}
                    setIsContentOpen={setIsContentOpen}
                    setIsOverflowing={setIsOverflowing}
                />

                {/* ── フッター：返信ボタン / 返信を表示ボタン / いいね ── */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">

                        {/*
                            返信ボタン
                            canReply が true（depth < 2）のときのみ表示します。
                            3段目（depth === 2）以降は非表示になります。

                            onClick で onReply を呼び出し、この返信自身の情報をプレビューとして渡す。
                            onReply?. の ?. は「onReply が渡されていない場合は何もしない」という安全な書き方
                            （オプショナルチェーン）。
                        */}
                        {canReply && (
                            <button
                                className="cursor-pointer rounded-[4px] w-[88px] h-[32px] 
                                flex items-center justify-center border border-[var(--accent-color)] 
                                text-[var(--accent-color)] hover:bg-[var(--accent-color)] 
                                hover:text-white transition-all"
                                onClick={() => onReply?.({ userName, content, postingTime })}
                            >
                                返信
                            </button>
                        )}

                        {/*
                            返信を表示ボタン
                            replyCount が 0 のときは非表示、1件以上のときに表示します。
                            depth に関係なく全段で表示します（既存の返信は読めるようにするため）。
                        */}
                        {replyCount > 0 && (
                            <button
                                className="flex items-center text-[var(--dark-gray)] cursor-pointer"
                                onClick={() => setIsReplyOpen(!isReplyOpen)}
                            >
                                {isReplyOpen ? '返信を非表示' : '返信を表示'}({replyCount})
                                {isReplyOpen
                                    ? <KeyboardArrowUpOutlinedIcon />
                                    : <KeyboardArrowDownOutlinedIcon />
                                }
                            </button>
                        )}

                    </div>
                    <div className="h-[40px] flex gap-8">
                        <Like id={id} type="answer" count={likeCount} isLiked={isLiked} />
                    </div>
                </div>

                {/*
                    ネスト返信エリア
                    isReplyOpen が true かつ replies が存在するときのみ表示します。
                    ThreadReply を再帰的に使い、depth を +1 して渡すことで
                    何段目かを追跡しています（再帰コンポーネント）。

                    onReply={onReply} を渡すことで、どの段の返信ボタンを押しても
                    最終的に QuestionPage のモーダル開閉処理まで届く（コールバックの引き継ぎ）。
                */}
                {isReplyOpen && replies && replies.map((reply) => (
                    <ThreadReply
                        key={reply.id}
                        userName={reply.userName}
                        content={reply.content}
                        postingTime={reply.postingTime}
                        likeCount={reply.likeCount}
                        isLiked={reply.isLiked}
                        replies={reply.replies}
                        depth={depth + 1} // 1段深くなるたびに +1 する
                        onReply={onReply}  // コールバックをそのまま引き継いで渡す
                    />
                ))}
            </div>
        </div>
    );
}