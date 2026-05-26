// routes/question.tsx
// ─────────────────────────────────────────
// 質問詳細ページ
//
// 【このファイルで定義しているコンポーネント一覧】
//   AnswererQuestionCard  : 回答者向け質問カード（⋮メニューなし）
//   AnswerPreviewCard     : 返信モーダルのプレビュー（回答カードの簡易表示）
//   AnswerCard            : 回答カード（isOwnerにより表示内容を出し分け）
//   AnswerForm            : 回答・返信入力フォーム（モーダル内で使用）
//   QuestionPage          : メインページ（このファイルの主役）
//
// 【AnswerCard を question.tsx に定義している理由】
//   Thread.tsx は確定済みコンポーネントのため修正不可。
//   Thread.tsx には以下の未実装・問題があるため、question.tsx 内に再実装した：
//     - isBestAnswer に関わらずベストアンサーラベルが常に表示される
//     - ThreadReply のレンダリングが未実装
//     - ベストアンサーに選ぶ・返信ボタンの onClick が空
//
// 【isOwner（オーナー判定）とは】
//   「今ログイン中のユーザーが、この質問を書いた本人かどうか」の判定（オーナー判定）
//   isOwner = true  → 質問者UI：⋮メニュー・ベストアンサーに選ぶボタンを表示
//   isOwner = false → 回答者UI：⋮メニューなし・回答作成ボタンを表示
//
// 【現時点のデータについて】
//   現時点ではモックデータ（仮のデータ）を使用しています。
//   API接続は後続フェーズで実装予定（TODO コメントで箇所を明記）。
// ─────────────────────────────────────────

import { useState } from 'react';
import { useParams } from 'react-router';

// ── 共通コンポーネント ──
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Time from '@/components/common/Time';
import Like from '@/components/common/Like';
import Bookmark from '@/components/common/Bookmark';
import Comment from '@/components/common/Comment';
import StatusChip from '@/components/common/StatusChip';
import TagChip from '@/components/common/TagChip';
import CardActionMenu from '@/components/common/CardActionMenu';
import CollapsibleContent from '@/components/common/CollapsibleContent';
import ScrollBar from '@/components/common/ScrollBar';
import Modal from '@/components/common/Modal';
import TextArea from '@/components/common/Textarea';
import ErrorMessages from '@/components/common/ErrorMessages';
import Header from '@/components/common/Header';

// ── questionDetail コンポーネント ──
import QuestionDetailCard from '@/components/questionDetail/QuestionDetailCard';
import ThreadReply from '@/components/questionDetail/ThreadReply';

// ── 型定義 ──
import type { QuestionType } from '@/types/question';

// ── MUIアイコン ──
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';


// ═════════════════════════════════════════
// 型定義（このページ固有）
// ─────────────────────────────────────────
// 「型」とは：
//   変数やオブジェクトに入れられるデータの形を決めるルールのこと（型定義・型注釈）。
//   例）userName は必ず文字列、likeCount は必ず数値、のように制約をかける。
//   型が違うデータを入れようとするとエラーになり、バグを事前に防げる。
// ═════════════════════════════════════════

// 返信データの型
// replies?: ReplyType[] と書くと「返信の中にさらに返信が入れられる」構造になる（再帰型）。
// ? は「あってもなくてもよい（省略可能）」を意味する（オプショナル）。
type ReplyType = {
  id: number;
  userName: string;
  content: string;
  postingTime: Date;
  likeCount: number;
  isLiked: boolean;
  replies?: ReplyType[]; // 返信の中の返信（2段ネスト対応）
};

// 回答データの型
type AnswerType = {
  id: number;
  userName: string;
  content: string;
  postingTime: Date;
  likeCount: number;
  isLiked: boolean;
  isBestAnswer: boolean; // ベストアンサーとして採用されているか
  replies: ReplyType[];  // この回答に対する返信の一覧
};

// 質問詳細データの型
// QuestionType（question.ts で定義）を「基礎」として、
// 詳細画面でしか使わない項目を2つ追加している（型の拡張・intersection type）。
//   content : 質問本文（一覧画面では表示しないが詳細画面では必要）
//   userId  : 質問投稿者のID（isOwner 判定に使う）
type QuestionDetailType = QuestionType & {
  content: string;
  userId: number;
};


// ═════════════════════════════════════════
// モックデータ（仮データ）
// ─────────────────────────────────────────
// 「モックデータ」とは：
//   API（サーバーとの通信）がまだ完成していない段階で、
//   見た目の確認やUI実装を進めるために用意する仮のデータのこと。
//   API接続後はこのデータをAPIのレスポンスに置き換える。
// ═════════════════════════════════════════

const MOCK_QUESTION: QuestionDetailType = {
  id: 1,

  // ★ userId をここで変更すると、質問者UI ↔ 回答者UI を切り替えて確認できる
  //   userId: 1 → MOCK_CURRENT_USER_ID(1) と一致 → isOwner = true（質問者UI）
  //   userId: 2 → 一致しない → isOwner = false（回答者UI）
  userId: 2,

  title: 'ECS Fargateでタスクが起動しない理由が知りたい',

  // statusId の意味：1 = 回答募集中 / 2 = 整理中 / 3 = 解決済み
  // この値を変えると画面の表示パターンが変わる
  statusId: 1,

  content:
    '現在、AWS ECS (Fargate) を利用して新規プロジェクトのコンテナ基盤を構築していますが、デプロイしたタスクが正常に実行されず、数秒から数十秒で「STOPPED」状態になってしまう現象に悩まされています。\n\nコンソール上で確認できる情報だけでは、すでに数日が経過してしまいました。AWSに詳しい皆様のお力をお借りしたいです。',
  isLiked: false,
  isBookmarked: false,
  userName: '投稿者ニックネーム',
  postingTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3時間前
  likeCount: 3,
  bookmarkCount: 3,
  replyCount: 2,
  tagNames: ['TypeScript', 'AWS', 'Docker'],
};

const MOCK_ANSWERS: AnswerType[] = [
  {
    id: 1,
    userName: '回答者（ニックネーム）',
    content:
      'その「バタつき」、心中お察しします。Fargate運用者なら誰もが一度は通る「洗礼」のようなものですね。特にログが1行も出ない時の絶望感は異常です。これまでの切り分け、特にネットワークとIAMをまず疑ったのは正解です。',
    postingTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
    likeCount: 3,
    isLiked: false,
    isBestAnswer: false,
    replies: [
      {
        id: 101,
        userName: '質問者（ニックネーム）',
        content: 'ありがとうございます！IAMロールの設定を見直してみます。',
        postingTime: new Date(Date.now() - 1000 * 60 * 90),
        likeCount: 1,
        isLiked: false,
        replies: [
          {
            id: 201,
            userName: '回答者（ニックネーム）',
            content: 'ecr:GetAuthorizationToken と ecr:BatchGetImage の権限が特に重要です。確認してみてください。',
            postingTime: new Date(Date.now() - 1000 * 60 * 80),
            likeCount: 2,
            isLiked: false,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    userName: '回答者（ニックネーム）',
    content:
      'テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト',
    postingTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likeCount: 3,
    isLiked: true,
    isBestAnswer: false,
    replies: [],
  },
];

// ─────────────────────────────────────────
// 仮のログインユーザーID
// TODO: API接続時は Supabase のセッションから取得する
//   const { data: { session } } = await supabase.auth.getSession();
//   const currentUserId = session?.user?.id;
// ─────────────────────────────────────────
const MOCK_CURRENT_USER_ID = 1;


// ═════════════════════════════════════════
// AnswererQuestionCard（回答者向け質問カード）
// ─────────────────────────────────────────
// 【なぜ QuestionDetailCard.tsx を使わないのか】
//   QuestionDetailCard.tsx は CardActionMenu（⋮メニュー）を
//   常に表示してしまうため、回答者UI（⋮なし）を作れない。
//   確定済みコンポーネントを直接修正できないので、
//   question.tsx 内に⋮なし版を別途実装している。
//
// 【使用場面】
//   ① isOwner = false のとき → メイン画面の質問カード
//   ② 回答者が「回答作成」モーダルを開いたとき → プレビュー表示
// ═════════════════════════════════════════

type AnswererQuestionCardProps = {
  question: QuestionDetailType;
};

function AnswererQuestionCard({ question }: AnswererQuestionCardProps) {

  // 本文の展開・折りたたみ状態を保持する（state管理）
  // false = 折りたたまれた状態 / true = 全文表示
  const [isContentOpen, setIsContentOpen] = useState(false);

  // テキストが3行を超えているかを保持する（state管理）
  // CollapsibleContent が計測して setIsOverflowing を呼ぶことで更新される
  // この値が true のとき ∧∨ ボタンを表示する
  const [isOverflowing, setIsOverflowing] = useState(false);

  return (
    <Card className="w-full">

      {/* ── ヘッダー行：ステータスバッジ・タイトル ／ ∧∨ボタン ── */}
      <div className="flex items-center justify-between py-[var(--spacing-16)]">
        <div className="flex items-center gap-4">
          {/* ステータスバッジ（id=1:回答募集中 / 2:整理中 / 3:解決済み）*/}
          <StatusChip id={question.statusId} />
          <h2 className="text-[length:var(--font-size-big)]">{question.title}</h2>
        </div>

        {/*
          ∧∨ボタンの表示条件：テキストが3行を超えている（isOverflowing = true）ときだけ表示。
          3行以内の場合は CollapsibleContent が自動で展開するため、ボタン自体が不要。

          表示するアイコンは isContentOpen の値で切り替える（条件付きレンダリング）：
            isContentOpen = true  → 現在展開中 → ∧（上矢印）を表示
            isContentOpen = false → 現在折りたたみ中 → ∨（下矢印）を表示
        */}
        {isOverflowing && (
          isContentOpen
            ? (
              <KeyboardArrowUpOutlinedIcon
                className="cursor-pointer text-[var(--dark-gray)]"
                onClick={() => setIsContentOpen(false)} // クリックで折りたたむ
              />
            )
            : (
              <KeyboardArrowDownOutlinedIcon
                className="cursor-pointer text-[var(--dark-gray)]"
                onClick={() => setIsContentOpen(true)} // クリックで展開する
              />
            )
        )}
      </div>

      {/*
        本文エリア（折りたたみ機能つき）
        CollapsibleContent が内部でテキストの行数を計測して
        setIsOverflowing・setIsContentOpen を呼び、状態を更新する。
      */}
      <CollapsibleContent
        content={question.content}
        isContentOpen={isContentOpen}
        setIsContentOpen={setIsContentOpen}
        setIsOverflowing={setIsOverflowing}
      />

      {/* ── フッター行：タグ一覧 ／ リアクション ── */}
      <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* tagNames 配列を map で1個ずつ TagChip に変換して並べる（配列のレンダリング）*/}
          {question.tagNames?.map((tag, index) => (
            <TagChip key={index} text={tag} />
            // key は React がリスト要素を識別するために必要。ないと警告が出る（key prop）
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Bookmark isBookmarked={question.isBookmarked ?? false} count={question.bookmarkCount} />
          {/* ?? false は「isBookmarked が undefined や null のとき false を使う」という意味（null合体演算子）*/}
          <Like isLiked={question.isLiked ?? false} count={question.likeCount} />
          <Comment count={question.replyCount} />
        </div>
      </div>
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerPreviewCard（返信モーダル内のプレビューカード）
// ─────────────────────────────────────────
// 返信モーダルを開いたとき「どの回答に返信するか」を確認できるように
// 対象の回答を簡略表示するカード。アクションボタンは持たない。
// ═════════════════════════════════════════

type AnswerPreviewCardProps = {
  answer: AnswerType;
};

function AnswerPreviewCard({ answer }: AnswerPreviewCardProps) {
  return (
    <Card className="w-full">
      {/* アバター・ニックネーム・投稿時刻 */}
      <div className="flex gap-2 py-[4px] mb-2">
        <Avatar className="w-[32px] h-[32px]" />
        <p>{answer.userName}</p>
        <Time postingTime={answer.postingTime} />
      </div>

      {/* 回答本文（縦にはみ出したらスクロールで表示） */}
      <p className="px-[var(--spacing-16)] text-[length:var(--font-size-medium)]
       leading-relaxed max-h-[120px] overflow-auto">
        {answer.content}
      </p>

      {/* いいね数（右寄せ） */}
      <div className="flex justify-end mt-2">
        <Like count={answer.likeCount} isLiked={answer.isLiked} />
      </div>
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerCard（回答カード）
// ─────────────────────────────────────────
// Thread.tsx の代替として question.tsx 内に実装。
// isOwner（質問者かどうか）によって表示内容を切り替える。
// ═════════════════════════════════════════

type AnswerCardProps = {
  answer: AnswerType;
  statusId: number;    // 質問のステータス（1:回答募集中 / 2:整理中 / 3:解決済み）
  isOwner: boolean;    // true = 質問者 / false = 回答者
  onBestAnswer: (answerId: number) => void; // ベストアンサーに選ぶボタンの処理
  onReply: (answerId: number) => void;      // 返信ボタンの処理
};

function AnswerCard({ answer, statusId, isOwner, onBestAnswer, onReply }: AnswerCardProps) {

  // 返信一覧の表示・非表示を保持する（state管理）
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  // 本文の展開・折りたたみ状態を保持する（state管理）
  // CardActionMenu と CollapsibleContent の両方に渡して連動させる
  const [isContentOpen, setIsContentOpen] = useState(false);

  // テキストが3行を超えているかを保持する（state管理）
  // CardActionMenu の ∧∨ボタンの表示・非表示に使う
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 解決済みかどうかを判定する（boolean型の変数）
  // ステータスID が 3（解決済み）なら true になる
  const isResolved = statusId === 3;

  // 「ベストアンサーに選ぶ」ボタンを表示するかどうか
  // 以下の3条件がすべて true のときだけ表示する（AND条件）：
  //   ① isOwner          = 質問者本人である
  //   ② !isResolved      = まだ解決済みでない
  //   ③ !isBestAnswer    = この回答はまだベストアンサーでない
  const showBestAnswerButton = isOwner && !isResolved && !answer.isBestAnswer;

  return (
    <Card
      className={[
        'flex flex-col gap-2',
        // ベストアンサーの場合は右端にグリーンの縦ボーダーを追加（UIデザイン準拠）
        // 配列を join(' ') で結合してクラス文字列にしている（テンプレートリテラルの代替）
        answer.isBestAnswer ? 'border-r-4 border-r-[var(--main-color)]' : '',
      ].join(' ')}
    >

      {/* ── ヘッダー行：アバター / 名前 / 時刻 ／ ベストアンサーラベル or メニュー ── */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 py-[4px]">
          <Avatar className="w-[32px] h-[32px]" />
          <p>{answer.userName}</p>
          <Time postingTime={answer.postingTime} />
        </div>

        {/*
          右上の表示を切り替える（条件付きレンダリング）：
            isBestAnswer = true  → 「ベストアンサー」ラベル（緑）を表示
            isBestAnswer = false → ⋮メニュー（CardActionMenu）を表示
        */}
        {answer.isBestAnswer ? (
          <div className="flex items-center gap-2 text-[var(--main-color)]">
            <EmojiEventsOutlinedIcon />
            <p>ベストアンサー</p>
          </div>
        ) : (
          <CardActionMenu
            isContentOpen={isContentOpen}
            setIsContentOpen={setIsContentOpen}
            onRemove={() => {
              // TODO: API接続時は DELETE /api/v1/answers/:answerId を呼ぶ
              console.log('回答削除:', answer.id);
            }}
            isOverflowing={isOverflowing}
          />
        )}
      </div>

      {/* 回答本文（3行を超えると自動で折りたたまれる） */}
      <CollapsibleContent
        content={answer.content}
        isContentOpen={isContentOpen}
        setIsContentOpen={setIsContentOpen}
        setIsOverflowing={setIsOverflowing}
      />

      {/* ── フッター行：左側 = 返信ボタン群 ／ 右側 = ベストアンサーボタン・いいね ── */}
      <div className="flex justify-between items-center">

        {/* 左側 */}
        <div className="flex items-center gap-4">

          {/* 返信ボタン：押すと onReply が呼ばれ、返信モーダルが開く */}
          <button
            className="cursor-pointer rounded-[4px] w-[88px] h-[32px] flex items-center justify-center border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all"
            onClick={() => onReply(answer.id)} // この回答のIDを親コンポーネントに渡す
          >
            返信
          </button>

          {/*
            「返信を表示」ボタン：replies が1件以上あるときだけ表示する（条件付きレンダリング）。
            クリックすると setIsReplyOpen が呼ばれ、isReplyOpen の true/false が切り替わる。
            prev は「現在の値」を意味し、!prev で現在値の反対（true→false, false→true）になる。
          */}
          {answer.replies.length > 0 && (
            <button
              className="flex items-center text-[var(--dark-gray)] cursor-pointer"
              onClick={() => setIsReplyOpen((prev) => !prev)}
            >
              {/* isReplyOpen の値によって表示テキストとアイコンを切り替える */}
              {isReplyOpen ? '返信を非表示' : '返信を表示'}
              ({answer.replies.length})
              {isReplyOpen
                ? <KeyboardArrowUpOutlinedIcon />
                : <KeyboardArrowDownOutlinedIcon />
              }
            </button>
          )}
        </div>

        {/* 右側 */}
        <div className="h-[40px] flex gap-8 items-center">

          {/*
            「ベストアンサーに選ぶ」ボタン
            showBestAnswerButton（質問者本人 かつ 未解決 かつ まだベストアンサーでない）
            が true のときだけ表示する（条件付きレンダリング）。
          */}
          {showBestAnswerButton && (
            <button
              onClick={() => onBestAnswer(answer.id)}
              className="transition-all hover:bg-[var(--main-color)] hover:text-white cursor-pointer flex items-center gap-1 text-[var(--main-color)] px-[var(--spacing-16)] py-[var(--spacing-8)] rounded-[4px] border border-[var(--main-color)]"
            >
              <EmojiEventsOutlinedIcon />
              <p>ベストアンサーに選ぶ</p>
            </button>
          )}

          <Like count={answer.likeCount} isLiked={answer.isLiked} />
        </div>
      </div>

      {/*
        返信一覧エリア
        isReplyOpen = true かつ 返信が1件以上あるときだけ表示する（条件付きレンダリング）。
        && の前の条件が false の場合、右側のJSXは評価・描画されない。
      */}
      {isReplyOpen && answer.replies.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* 本文と返信エリアの区切り線 */}
          <div className="bg-[var(--light-gray)] h-[1px] w-full" />

          {/* replies 配列を map で1個ずつ ThreadReply コンポーネントに変換して並べる */}
          {answer.replies.map((reply) => (
            <ThreadReply
              key={reply.id}
              userName={reply.userName}
              content={reply.content}
              postingTime={reply.postingTime}
              likeCount={reply.likeCount}
              replyCount={reply.replies?.length ?? 0}
              // ?. は「replies が存在するときだけ .length を取得する」という書き方（オプショナルチェーン）
              // ?? 0 は「undefined や null のとき 0 を使う」という意味（null合体演算子）
              isLiked={reply.isLiked}
            />
          ))}
        </div>
      )}
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerForm（回答・返信フォーム）
// ─────────────────────────────────────────
// 「回答作成」「返信」両方のモーダルで使い回せる共通フォーム。
// preview に渡す内容を変えることで、どちらのモーダルでも使える。
//   回答モーダル → preview = <AnswererQuestionCard />（質問のプレビュー）
//   返信モーダル → preview = <AnswerPreviewCard />（回答のプレビュー）
// ═════════════════════════════════════════

type AnswerFormProps = {
  title: string;                 // フォームのタイトル文字列
  preview: React.ReactNode;      // プレビューエリアに表示するコンポーネント（React.ReactNode = JSXなら何でも渡せる）
  content: string;               // 入力中のテキスト
  onChange: (v: string) => void; // テキスト変更時のコールバック（親のstateを更新する）
  error: string;                 // バリデーションエラー文字列（空文字なら非表示）
  isSubmitting: boolean;         // 送信中かどうか（true のとき送信ボタンを非活性化して二重送信を防ぐ）
  onSubmit: () => void;          // 送信ボタンを押したときの処理
};

function AnswerForm({
  title, preview, content, onChange, error, isSubmitting, onSubmit,
}: AnswerFormProps) {
  return (
    <div className="w-full max-w-[750px] px-4 sm:px-0 flex flex-col 
    gap-[var(--spacing-16)] max-h-[80vh] overflow-y-auto">

      {/* プレビューエリア：縦にはみ出したらスクロールで表示 */}
      <div className="max-h-[240px] overflow-auto">
        {preview}
      </div>

      {/* 入力エリア */}
      <div className="flex flex-col gap-[var(--spacing-8)]">
      {/* ラベル：* は必須入力を示す（赤色で表示） */}
        <label className="text-[length:var(--font-size-normal)] font-semibold">
          {title}<span className="text-[var(--danger-color)]">*</span>
          {/* * は「必須入力」を示すマーク */}
        </label>

        {/* テキストエリア：ユーザーが入力するたびに onChange が呼ばれ、親の state が更新される */}
        <TextArea
          placeholder="例：setStateによる更新は非同期で行われるため、同じレンダーサイクル内では古い値を参照してしまうからです。setStateは..."
          value={content}
          onChange={onChange}
          rows={5}
        />

        {/* error が空文字でない場合のみ ErrorMessages を表示する（条件付きレンダリング）*/}
        {error && <ErrorMessages message={error} />}
      </div>

      {/* 送信ボタン */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting} // isSubmitting = true のときクリックできなくなる（二重送信防止）
        className={[
          'w-[250px] max-w-full h-[80px] mx-auto',
          'rounded-[var(--radius-small)] shadow-[var(--box-shadow)]',
          'text-white text-[length:var(--font-size-medium)] font-semibold',
          'transition-all duration-200',
          // isSubmitting の状態でクラスを切り替えてグレー（送信不可）or グリーン（送信可）を出し分ける
          isSubmitting
            ? 'bg-[var(--light-gray)] cursor-not-allowed'
            : 'bg-[image:var(--gradation-green)] cursor-pointer hover:opacity-90',
        ].join(' ')}
      >
        {/* 送信中と送信前でボタンのテキストを切り替えてユーザーにフィードバックを出す */}
        {isSubmitting ? '送信中...' : '回答送信'}
      </button>
    </div>
  );
}


// ═════════════════════════════════════════
// QuestionPage（メインページ）
// ─────────────────────────────────────────
// このファイルの主役。ここで state の管理・操作の処理・画面の描画をまとめて行う。
// ═════════════════════════════════════════

export default function QuestionPage() {

  // ─────────────────────────────────────
  // URLパラメータの取得（useParams）
  //
  // React Router の useParams を使って URL から値を取り出す。
  // routes.ts で route("question/:id", ...) と定義されているので
  // ここで id という名前で取り出せる。
  //   例）URL が /question/42 → id = "42"
  // ─────────────────────────────────────
  const { id } = useParams<{ id: string }>();


  // ─────────────────────────────────────
  // 画面が覚えておく情報の定義（useState・state管理）
  //
  // useState の基本：
  //   const [値, 値を変える関数] = useState(初期値)
  //
  // 「値を変える関数」を呼ぶと画面が自動で再描画される（再レンダリング）。
  // 直接 question.statusId = 3 のように書き換えても画面は更新されないので
  // 必ず「値を変える関数（set○○）」を使う。
  // ─────────────────────────────────────

  // 質問データ（モックデータで初期化）
  const [question, setQuestion] = useState<QuestionDetailType>(MOCK_QUESTION);

  // 回答一覧（モックデータで初期化）
  const [answers, setAnswers] = useState<AnswerType[]>(MOCK_ANSWERS);

  // ── isOwner 判定（質問者かどうか） ──
  // ログイン中のユーザーIDと質問投稿者IDを比較する。
  // 一致 → true（質問者UI） / 不一致 → false（回答者UI）
  // TODO: API接続時は MOCK_CURRENT_USER_ID を Supabase セッションのIDに置き換える
  const isOwner = question.userId === MOCK_CURRENT_USER_ID;

  // ── 回答投稿モーダルの状態管理 ──
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);  // 開閉状態
  const [answerContent, setAnswerContent] = useState('');             // 入力テキスト
  const [answerError, setAnswerError] = useState('');                 // エラーメッセージ
  const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false); // 送信中フラグ

  // ── 返信投稿モーダルの状態管理 ──
  // null     = モーダルを表示しない
  // 数値(id) = その回答IDへの返信モーダルを表示する
  const [replyTargetAnswerId, setReplyTargetAnswerId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);


  // ─────────────────────────────────────
  // バリデーション（入力値の検証）
  //
  // 送信ボタンが押されたとき「内容が正しく入力されているか確認する処理」。
  // 回答・返信どちらも同じルールのため、共通の関数として定義している。
  //
  // 引数：
  //   text     : チェックするテキスト
  //   setError : エラーメッセージをセットする関数（回答用・返信用で別々に渡す）
  //
  // 戻り値：
  //   true  = エラーあり（呼び出し元で処理を中断するために使う）
  //   false = 問題なし（送信処理に進んでよい）
  // ─────────────────────────────────────
  const validate = (text: string, setError: (msg: string) => void): boolean => {
    if (!text.trim()) {
      // trim() は前後の空白を取り除く。空白のみの入力をはじくために使う
      setError('内容を入力してください');
      return true; // エラーあり → 呼び出し元で return させる
    }
    if (text.length > 5000) {
      setError('文字数制限を超えています。5000文字以内で入力してください。');
      return true;
    }
    return false; // エラーなし → 送信処理に進んでよい
  };


  // ─────────────────────────────────────
  // 回答を投稿する処理
  // TODO: API接続時は POST /api/v1/questions/:id/answers を呼ぶ
  // ─────────────────────────────────────
  const handlePostAnswer = () => {

    // バリデーションを実行。エラーありなら return で処理をここで止める
    if (validate(answerContent, setAnswerError)) return;

    setIsAnswerSubmitting(true); // 送信中フラグをON → ボタンが非活性になる

    // 新しい回答オブジェクトを作ってローカルのstateに追加する（APIなしでUIを更新）
    // API接続後はサーバーから返ってきたデータを使う
    const newAnswer: AnswerType = {
      id: Date.now(), // 仮のID。Date.now() は現在のミリ秒を返すので一意になる
      userName: 'あなた',
      content: answerContent,
      postingTime: new Date(),
      likeCount: 0,
      isLiked: false,
      isBestAnswer: false,
      replies: [],
    };

    // 既存の回答一覧の末尾に新しい回答を追加する（配列の更新）
    // スプレッド構文（...prev）で元の配列をコピーして、末尾に newAnswer を加える
    setAnswers((prev) => [...prev, newAnswer]);

    // 質問の replyCount（回答件数）を1増やす
    // スプレッド構文（...prev）で他のプロパティはそのままコピーして statusId だけ更新している
    setQuestion((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));

    // モーダルを閉じて入力内容・エラーをリセット
    setIsAnswerSubmitting(false);
    setIsAnswerModalOpen(false);
    setAnswerContent('');
    setAnswerError('');
  };


  // ─────────────────────────────────────
  // 返信を投稿する処理
  // TODO: API接続時は POST /api/v1/answers/:answerId/replies を呼ぶ
  // ─────────────────────────────────────
  const handlePostReply = () => {

    if (validate(replyContent, setReplyError)) return;
    if (!replyTargetAnswerId) return; // 返信対象がない場合は念のため中断

    setIsReplySubmitting(true);

    const newReply: ReplyType = {
      id: Date.now(),
      userName: 'あなた',
      content: replyContent,
      postingTime: new Date(),
      likeCount: 0,
      isLiked: false,
      replies: [],
    };

    // 対象の回答だけ replies を更新し、それ以外の回答はそのまま保つ（配列の部分更新）
    //
    // map とは：配列の全要素を1個ずつ処理して、新しい配列を返す関数（配列の変換・map）
    //   例）回答一覧 = [回答A, 回答B, 回答C]
    //       map で1個ずつ見て…
    //         回答A → IDが違う → そのまま返す
    //         回答B → IDが一致した → replies に newReply を追加して返す
    //         回答C → IDが違う → そのまま返す
    //       結果：[回答A, 回答B（返信追加済み）, 回答C]
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.id === replyTargetAnswerId
          ? { ...answer, replies: [...answer.replies, newReply] } // IDが一致した回答を更新
          : answer // IDが一致しない回答はそのまま
      )
    );

    setIsReplySubmitting(false);
    setReplyTargetAnswerId(null); // null にするとモーダルが閉じる
    setReplyContent('');
    setReplyError('');
  };


  // ─────────────────────────────────────
  // ベストアンサーを採用する処理
  // TODO: API接続時は PATCH /api/v1/answers/:answerId/accept を呼ぶ
  // ─────────────────────────────────────
  const handleBestAnswer = (answerId: number) => {

    // 全回答の isBestAnswer を更新する（配列の変換・map）
    //   採用した回答 → isBestAnswer: true
    //   それ以外    → isBestAnswer: false
    setAnswers((prev) =>
      prev.map((answer) => ({
        ...answer, // 他のプロパティはそのままコピー
        isBestAnswer: answer.id === answerId, // IDが一致するものだけ true、他は false
      }))
    );

    // ベストアンサー採用後は質問のステータスを「解決済み（3）」に変更する
    setQuestion((prev) => ({ ...prev, statusId: 3 }));
  };


  // 返信モーダルに表示する「返信対象の回答」を answers 配列から探す（配列の検索・find）
  // find は条件に一致する最初の要素を返す。見つからなければ undefined を返す。
  const replyTargetAnswer = answers.find((a) => a.id === replyTargetAnswerId);


  // ─────────────────────────────────────
  // 画面の描画（レンダリング）
  // ─────────────────────────────────────
  return (
    <>
      <Header />

      <div className="min-h-screen bg-[var(--base-color)] pt-[64px]">
        <div className="max-w-[1440px] mx-auto px-[var(--spacing-32)] py-[var(--spacing-24)] flex flex-col gap-[var(--spacing-24)]">

          {/*
            質問カードの出し分け（条件付きレンダリング）
              isOwner = true  → QuestionDetailCard（⋮メニューあり）
              isOwner = false → AnswererQuestionCard（⋮メニューなし）
            三項演算子（condition ? A : B）を使って切り替えている。
          */}
          {isOwner
            ? <QuestionDetailCard question={question} />
            : <AnswererQuestionCard question={question} />
          }

          {/* ── 回答一覧セクション ── */}
          <section className="flex flex-col gap-[var(--spacing-16)]">

            <div className="flex items-center justify-between border-b border-[var(--main-color)] py-[var(--spacing-16)]">
              <h2 className="text-[length:var(--font-size-big)]">回答一覧</h2>
            </div>

            {/* カスタムスクロールバーつきの縦スクロールエリア */}
            <ScrollBar className="flex flex-col gap-[var(--spacing-16)] max-h-[calc(100vh-300px)]">

              {/*
                回答が0件のときはメッセージを、1件以上のときは回答カードを表示する（条件付きレンダリング）。
                三項演算子（condition ? A : B）で切り替えている。
              */}
              {answers.length === 0 ? (
                <p className="text-center text-[var(--dark-gray)] py-[var(--spacing-32)]">
                  まだ回答がありません
                </p>
              ) : (
                // answers 配列を map で1個ずつ AnswerCard コンポーネントに変換して並べる（配列のレンダリング）
                answers.map((answer) => (
                  <AnswerCard
                    key={answer.id} // React がリスト要素を識別するために必要（key prop）
                    answer={answer}
                    statusId={question.statusId}
                    isOwner={isOwner}
                    onBestAnswer={handleBestAnswer}
                    // 返信ボタンが押されたら replyTargetAnswerId に ID をセット
                    // → replyTargetAnswerId が null でなくなるため返信モーダルが表示される
                    onReply={(answerId) => setReplyTargetAnswerId(answerId)}
                  />
                ))
              )}
            </ScrollBar>

            {/*
              「回答作成」ボタン
              表示条件：!isOwner（回答者）かつ !isResolved（未解決）のとき
              && の前の条件が false なら右側は描画されない（ショートサーキット評価）
            */}
            {!isOwner && question.statusId !== 3 && (
              <button
                onClick={() => setIsAnswerModalOpen(true)} // クリックでモーダルを開く
                className="w-[410px] h-[80px] bg-[image:var(--gradation-green)] 
                text-white text-[length:var(--font-size-medium)] font-semibold 
                rounded-[var(--radius-small)] shadow-[var(--box-shadow)] 
                cursor-pointer hover:opacity-90 transition-all mt-[var(--spacing-8)] mx-auto"
              >
                回答作成
              </button>
            )}
          </section>
        </div>
      </div>

      {/*
        回答投稿モーダル（回答者のみ）
        isAnswerModalOpen = true のときだけ描画される（条件付きレンダリング）。
        Modal コンポーネントは画面全体を覆うオーバーレイ（背景を暗くして前面に表示する）。
      */}
      {isAnswerModalOpen && (
        <Modal
          onClose={() => {
            // ×ボタンを押したときの処理：モーダルを閉じて入力内容・エラーをリセット
            setIsAnswerModalOpen(false);
            setAnswerContent('');
            setAnswerError('');
          }}
        >
          <AnswerForm
            title="回答を入力してください"
            // 回答モーダルのプレビューには質問カードをそのまま表示する（UIデザイン準拠）
            preview={<AnswererQuestionCard question={question} />}
            content={answerContent}
            onChange={setAnswerContent}
            error={answerError}
            isSubmitting={isAnswerSubmitting}
            onSubmit={handlePostAnswer}
          />
        </Modal>
      )}

      {/*
        返信投稿モーダル（質問者・回答者どちらも使用）
        replyTargetAnswerId が null でなく、かつ対象回答が見つかったときだけ描画される。
        find で見つからなかった場合（undefined）も &&で弾かれるため安全。
      */}
      {replyTargetAnswerId !== null && replyTargetAnswer && (
        <Modal
          onClose={() => {
            // モーダルを閉じて返信対象・入力内容・エラーをリセット
            setReplyTargetAnswerId(null); // null に戻すとモーダルが消える
            setReplyContent('');
            setReplyError('');
          }}
        >
          <AnswerForm
            title="回答を入力してください"
            // 返信モーダルのプレビューには返信対象の回答カードを表示する（UIデザイン準拠）
            preview={<AnswerPreviewCard answer={replyTargetAnswer} />}
            content={replyContent}
            onChange={setReplyContent}
            error={replyError}
            isSubmitting={isReplySubmitting}
            onSubmit={handlePostReply}
          />
        </Modal>
      )}
    </>
  );
}