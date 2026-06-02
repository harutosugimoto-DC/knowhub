// routes/question.tsx — 質問詳細ページ

import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

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

import QuestionDetailCard from '@/components/questionDetail/QuestionDetailCard';
import ThreadReply from '@/components/questionDetail/ThreadReply';

import type { QuestionDetail } from '@/types/question';
import type { AnswerType, AnswerReplyType } from '@/types/answer';

import { getQuestionById, getQuestionAnswers, postAnswer, deleteQuestion } from '@/api/questionService';
import { acceptAnswer, deleteAnswer } from '@/api/answerService';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router';
import { toast } from '@/utils/toast';

import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';


// ═════════════════════════════════════════
// AnswererQuestionCard（回答者向け質問カード）
// ─────────────────────────────────────────

type AnswererQuestionCardProps = {
  question: QuestionDetail;
};

function AnswererQuestionCard({ question }: AnswererQuestionCardProps) {
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between py-[var(--spacing-16)]">
        <div className="flex items-center gap-4">
          <StatusChip name={question.statusId} />
          <h2 className="text-[length:var(--font-size-big)]">{question.title}</h2>
        </div>
        {isOverflowing && (
          isContentOpen
            ? <KeyboardArrowUpOutlinedIcon className="cursor-pointer text-[var(--dark-gray)]" onClick={() => setIsContentOpen(false)} />
            : <KeyboardArrowDownOutlinedIcon className="cursor-pointer text-[var(--dark-gray)]" onClick={() => setIsContentOpen(true)} />
        )}
      </div>
      <div className='!select-text'>
        <CollapsibleContent
          content={question.content}
          isContentOpen={isContentOpen}
          setIsContentOpen={setIsContentOpen}
          setIsOverflowing={setIsOverflowing}
        />
      </div>

      <div className="px-[var(--spacing-16)] py-[var(--spacing-8)] flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {question.tagNames?.map((tag, index) => (
            <TagChip key={index} text={tag} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Bookmark id={question.id} isBookmarked={question.isBookmarked ?? false} count={question.bookmarkCount} />
          <Like id={question.id} type='question' isLiked={question.isLiked ?? false} count={question.likeCount} />
          <Comment count={question.replyCount} />
        </div>
      </div>
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerPreviewCard（回答返信モーダル内のプレビューカード）

type AnswerPreviewCardProps = {
  answer: AnswerType;
};

function AnswerPreviewCard({ answer }: AnswerPreviewCardProps) {
  return (
    <Card className="w-full">
      <div className="flex gap-2 py-[4px] mb-2">
        <Avatar src={answer.iconURL} className="w-[32px] h-[32px]" />
        <p>{answer.userName}</p>
        <Time postingTime={answer.postingTime} />
      </div>
      <p className="!select-text px-[var(--spacing-16)] text-[length:var(--font-size-medium)] leading-relaxed max-h-[120px] overflow-auto">
        {answer.content}
      </p>
      <div className="flex justify-end mt-2">
        <Like id={answer.id} type='answer' count={answer.likeCount} isLiked={answer.isLiked} />
      </div>
    </Card>
  );
}


// ReplyPreviewCard（ThreadReply返信モーダル内のプレビューカード）

type ReplyPreviewCardProps = {
  reply: {
    iconURL: string;
    userName: string;
    content: string;
    postingTime: string;
  };
};

function ReplyPreviewCard({ reply }: ReplyPreviewCardProps) {
  return (
    <Card className="w-full">
      <div className="flex gap-2 py-[4px] mb-2">
        <Avatar src={reply.iconURL} className="w-[32px] h-[32px]" />
        <p>{reply.userName}</p>
        <Time postingTime={reply.postingTime} />
      </div>
      <p className="!select-text px-[var(--spacing-16)] text-[length:var(--font-size-medium)] leading-relaxed max-h-[120px] overflow-auto">
        {reply.content}
      </p>
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerCard（回答カード）

type AnswerCardProps = {
  answer: AnswerType;
  statusId: string;
  isOwner: boolean;
  currentUserId: string;
  onBestAnswer: (answerId: string) => void;
  onReply: (answerId: string) => void;
  onThreadReply: (preview: { id: string; iconURL: string; userName: string; content: string; postingTime: string }) => void;
  onDeleteAnswer: (answerId: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
};

function AnswerCard({ answer, statusId, isOwner, currentUserId, onBestAnswer, onReply, onThreadReply, onDeleteAnswer, onDeleteReply }: AnswerCardProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const isResolved = statusId === '解決済み';
  const showBestAnswerButton = isOwner && !isResolved && !answer.isBestAnswer;

  return (
    <Card
      className={[
        'flex flex-col gap-2',
        answer.isBestAnswer ? 'border-r-4 border-r-[var(--main-color)]' : '',
      ].join(' ')}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2 py-[4px]">
          <Avatar src={answer.iconURL} className="w-[32px] h-[32px]" />
          <p>{answer.userName}</p>
          <Time postingTime={answer.postingTime} />
        </div>

        {answer.isBestAnswer ? (
          <div className="flex items-center gap-2 text-[var(--main-color)]">
            <EmojiEventsOutlinedIcon />
            <p>ベストアンサー</p>
          </div>
        ) : answer.userId === currentUserId ? (
          <CardActionMenu
            isContentOpen={isContentOpen}
            setIsContentOpen={setIsContentOpen}
            onRemove={() => onDeleteAnswer(answer.id)}
            isOverflowing={isOverflowing}
          />
        ) : null}
      </div>

      <CollapsibleContent
        content={answer.content}
        isContentOpen={isContentOpen}
        setIsContentOpen={setIsContentOpen}
        setIsOverflowing={setIsOverflowing}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="cursor-pointer rounded-[4px] w-[88px] h-[32px] flex items-center justify-center border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all"
            onClick={() => onReply(answer.id)}
          >
            返信
          </button>

          {answer.replies.length > 0 && (
            <button
              className="flex items-center text-[var(--dark-gray)] cursor-pointer"
              onClick={() => setIsReplyOpen((prev) => !prev)}
            >
              {isReplyOpen ? '返信を非表示' : '返信を表示'}
              ({answer.replies.length})
              {isReplyOpen ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
            </button>
          )}
        </div>

        <div className="h-[40px] flex gap-8 items-center">
          {showBestAnswerButton && (
            <button
              onClick={() => onBestAnswer(answer.id)}
              className="transition-all hover:bg-[var(--main-color)] hover:text-white cursor-pointer flex items-center gap-1 text-[var(--main-color)] px-[var(--spacing-16)] py-[var(--spacing-8)] rounded-[4px] border border-[var(--main-color)]"
            >
              <EmojiEventsOutlinedIcon />
              <p>ベストアンサーに選ぶ</p>
            </button>
          )}
          <Like id={answer.id} type="answer" count={answer.likeCount} isLiked={answer.isLiked} />
        </div>
      </div>

      {isReplyOpen && answer.replies.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--light-gray)] h-[1px] w-full" />
          {answer.replies.map((reply: AnswerReplyType) => (
            <ThreadReply
              key={reply.id}
              id={reply.id}
              userId={reply.userId}
              iconURL={reply.iconURL}
              userName={reply.userName}
              content={reply.content}
              postingTime={reply.postingTime}
              likeCount={reply.likeCount}
              isLiked={reply.isLiked}
              replies={reply.replies}
              depth={1}
              currentUserId={currentUserId}
              onReply={(preview) => onThreadReply(preview)}
              onDeleteReply={onDeleteReply}
            />
          ))}
        </div>
      )}
    </Card>
  );
}


// ═════════════════════════════════════════
// AnswerForm（回答・返信フォーム）

type AnswerFormProps = {
  title: string;
  preview: React.ReactNode;
  content: string;
  onChange: (v: string) => void;
  error: string;
  isSubmitting: boolean;
  onSubmit: () => void;
};

function AnswerForm({ title, preview, content, onChange, error, isSubmitting, onSubmit }: AnswerFormProps) {
  return (
    <div style={{ width: '750px', maxWidth: '90vw' }} className="sm:px-0 flex flex-col gap-[var(--spacing-8)] max-h-[80vh] overflow-y-auto">
      <div className="pb-4 px-4 max-h-[240px] overflow-auto">
        {preview}
      </div>
      <div className="flex flex-col gap-[var(--spacing-16)] px-4 pb-4 items-center">
        <label className="w-full flex py-[var(--spacing-8)] justify-between items-center border-b border-[var(--main-color)]">
          <p className="text-[length:var(--font-size-big)]">
            {title}
            <span className="text-[var(--danger-color)]">*</span>
          </p>
        </label>
        <TextArea
          placeholder="例：setStateによる更新は非同期で行われるため、同じレンダーサイクル内では古い値を参照してしまうからです。"
          value={content}
          onChange={onChange}
          rows={5}
        />
        {error && <ErrorMessages message={error} />}
        <Button className='w-[344px]' onClick={onSubmit} text={isSubmitting ? '送信中...' : '回答送信'} disabled={isSubmitting} />
      </div>

    </div>
  );
}


// ═════════════════════════════════════════
// QuestionPage（メインページ）

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = user?.id === question?.userId;

  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);

  const [replyTargetAnswerId, setReplyTargetAnswerId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  const [replyTargetReply, setReplyTargetReply] = useState<{
    id: string;
    iconURL: string;
    userName: string;
    content: string;
    postingTime: string;
  } | null>(null);


  // 質問と回答を取得
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [q, a] = await Promise.all([
          getQuestionById(id),
          getQuestionAnswers(id),
        ]);
        setQuestion(q);
        setAnswers(a);
      } catch (err) {
        console.error('データ取得エラー:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);


  const validate = (text: string, setError: (msg: string) => void): boolean => {
    if (!text.trim()) {
      setError('内容を入力してください');
      return true;
    }
    if (text.length > 5000) {
      setError('文字数制限を超えています。5000文字以内で入力してください。');
      return true;
    }
    return false;
  };

  const refreshAnswers = async () => {
    if (!id) return;
    const updated = await getQuestionAnswers(id);
    setAnswers(updated);
  };


  // 回答を投稿
  const handlePostAnswer = async () => {
    if (validate(answerContent, setAnswerError)) return;
    if (!id) return;

    setIsAnswerSubmitting(true);
    try {
      await postAnswer({ questionId: id, content: answerContent });
      await refreshAnswers();

      setIsAnswerModalOpen(false);
      setAnswerContent('');
      setAnswerError('');
    } catch {
      // axiosClientがエラートーストを自動表示
    } finally {
      setIsAnswerSubmitting(false);
    }
  };


  // 回答への返信を投稿
  const handlePostReply = async () => {
    if (validate(replyContent, setReplyError)) return;
    if (!replyTargetAnswerId || !id) return;

    setIsReplySubmitting(true);
    try {
      await postAnswer({ questionId: id, content: replyContent, parentAnswerId: replyTargetAnswerId });
      await refreshAnswers();
      setReplyTargetAnswerId(null);
      setReplyContent('');
      setReplyError('');
    } catch {
      setReplyError('返信の投稿に失敗しました');
    } finally {
      setIsReplySubmitting(false);
    }
  };


  // ThreadReply への返信を投稿
  const handlePostThreadReply = async () => {
    if (validate(replyContent, setReplyError)) return;
    if (!replyTargetReply || !id) return;

    setIsReplySubmitting(true);
    try {
      await postAnswer({ questionId: id, content: replyContent, parentAnswerId: replyTargetReply.id });
      await refreshAnswers();
      setReplyTargetReply(null);
      setReplyContent('');
      setReplyError('');
    } catch {
      setReplyError('返信の投稿に失敗しました');
    } finally {
      setIsReplySubmitting(false);
    }
  };


  // 質問を削除してトップへ戻る
  const handleDeleteQuestion = async () => {
    if (!id) return;
    await deleteQuestion(id);
    navigate('/top');
  };

  // 回答・返信を削除
  const handleDeleteAnswer = async (answerId: string) => {
    await deleteAnswer(answerId);
    await refreshAnswers();
  };

  // ベストアンサーを採用
  const handleBestAnswer = async (answerId: string) => {
    try {
      await acceptAnswer(answerId);
      setAnswers((prev) =>
        prev.map((a) => ({ ...a, isBestAnswer: a.id === answerId }))
      );
      setQuestion((prev) => prev ? { ...prev, statusId: '解決済み' } : prev);
    } catch (err) {
      console.error('ベストアンサー設定エラー:', err);
    }
  };


  const replyTargetAnswer = answers.find((a) => a.id === replyTargetAnswerId);


  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[var(--base-color)] pt-[64px] flex items-center justify-center">
          <Loading />
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <>
        <div className="min-h-screen bg-[var(--base-color)] pt-[64px] flex items-center justify-center">
          <p className="text-[var(--dark-gray)]">質問が見つかりません</p>
        </div>
      </>
    );
  }


  return (
    <>
      <div className="min-h-screen bg-[var(--base-color)] pt-[64px]">
        <div className="max-w-[1440px] mx-auto px-[var(--spacing-32)] py-[var(--spacing-24)] flex flex-col gap-[var(--spacing-24)]">

          {isOwner
            ? <QuestionDetailCard question={question} onDelete={handleDeleteQuestion} />
            : <AnswererQuestionCard question={question} />
          }

          <section className="flex flex-col gap-[var(--spacing-16)]">
            <div className="flex items-center justify-between border-b border-[var(--main-color)] py-[var(--spacing-16)]">
              <h2 className="text-[length:var(--font-size-big)]">回答一覧</h2>
            </div>
            <Loading />

            <ScrollBar className="py-4 flex flex-col gap-[var(--spacing-16)] max-h-[calc(100vh-300px)]">
              {answers.length === 0 ? (
                <p className="text-center text-[var(--dark-gray)] py-[var(--spacing-32)]">
                  まだ回答がありません
                </p>
              ) : (
                answers.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    statusId={question.statusId}
                    isOwner={isOwner}
                    currentUserId={user?.id ?? ''}
                    onBestAnswer={handleBestAnswer}
                    onReply={(answerId) => setReplyTargetAnswerId(answerId)}
                    onThreadReply={(preview) => setReplyTargetReply(preview)}
                    onDeleteAnswer={handleDeleteAnswer}
                    onDeleteReply={handleDeleteAnswer}
                  />
                ))
              )}
            </ScrollBar>

            {!isOwner && question.statusId !== '解決済み' && (
              // <button
              //   onClick={() => setIsAnswerModalOpen(true)}
              //   className="w-[410px] h-[80px] bg-[image:var(--gradation-green)]
              //   text-white text-[length:var(--font-size-medium)] font-semibold
              //   rounded-[var(--radius-small)] shadow-[var(--box-shadow)]
              //   cursor-pointer hover:opacity-90 transition-all mt-[var(--spacing-8)] mx-auto"
              // >
              //   回答作成
              // </button>]
              <div className='w-full flex items-center justify-center'>

                <Button onClick={() => setIsAnswerModalOpen(true)} text='回答作成' className='w-[410px]' />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 回答投稿モーダル */}
      {isAnswerModalOpen && (
        <Modal onClose={() => { setIsAnswerModalOpen(false); setAnswerContent(''); setAnswerError(''); }}>
          <AnswerForm
            title="回答を入力してください"
            preview={<AnswererQuestionCard question={question} />}
            content={answerContent}
            onChange={setAnswerContent}
            error={answerError}
            isSubmitting={isAnswerSubmitting}
            onSubmit={handlePostAnswer}
          />
        </Modal>
      )}

      {/* 回答への返信モーダル */}
      {replyTargetAnswerId !== null && replyTargetAnswer && (
        <Modal onClose={() => { setReplyTargetAnswerId(null); setReplyContent(''); setReplyError(''); }}>
          <AnswerForm
            title="返信を入力してください"
            preview={<AnswerPreviewCard answer={replyTargetAnswer} />}
            content={replyContent}
            onChange={setReplyContent}
            error={replyError}
            isSubmitting={isReplySubmitting}
            onSubmit={handlePostReply}
          />
        </Modal>
      )}

      {/* ThreadReply への返信モーダル */}
      {replyTargetReply !== null && (
        <Modal onClose={() => { setReplyTargetReply(null); setReplyContent(''); setReplyError(''); }}>
          <AnswerForm
            title="返信を入力してください"
            preview={<ReplyPreviewCard reply={replyTargetReply} />}
            content={replyContent}
            onChange={setReplyContent}
            error={replyError}
            isSubmitting={isReplySubmitting}
            onSubmit={handlePostThreadReply}
          />
        </Modal>
      )}
    </>
  );
}
