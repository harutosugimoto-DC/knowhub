// routes/question.tsx — 質問詳細ページ

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';

import ScrollBar from '@/components/common/ScrollBar';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import QuestionDetailCard from '@/components/questionDetail/QuestionDetailCard';
import AnswerCard from '@/components/questionDetail/AnswerCard';

import AnswerFormModal from '@/components/questionDetail/AnswerFormModal';
import {
  AnswererQuestionPreviewCard,
  AnswerPreviewCard,
  ReplyPreviewCard
} from '@/components/questionDetail/QuestionPreviewCards';

import type { QuestionDetail } from '@/types/question';
import type { AnswerType } from '@/types/answer';

import { getQuestionById, getQuestionAnswers, postAnswer, deleteQuestion } from '@/api/questionService';
import { acceptAnswer, deleteAnswer } from '@/api/answerService';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/utils/toast';

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  // 返信対象（「回答」か「スレッド内のリプライ」か）を一元管理するState
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    type: 'answer' | 'thread';
    previewData: any;
  } | null>(null);

  const isOwner = user?.id === question?.userId;

  // データ同期用共通関数
  const refreshAnswers = useCallback(async () => {
    if (!id) return;
    try {
      const [updatedAnswers, updatedQuestion] = await Promise.all([
        getQuestionAnswers(id),
        getQuestionById(id),
      ]);
      setAnswers(updatedAnswers);
      setQuestion(updatedQuestion);
    } catch (err) {
      console.error('データ更新エラー:', err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      await refreshAnswers();
      setIsLoading(false);
    };
    fetchData();
  }, [id, refreshAnswers]);

  // 回答を投稿
  const handlePostAnswer = async (content: string) => {
    if (!id) return;
    await postAnswer({ questionId: id, content });
    await refreshAnswers();
    toast.success('回答を投稿しました');
    setIsAnswerModalOpen(false);
  };
  // 返信を投稿（回答への返信・スレッドへの返信を一括処理）
  const handlePostReply = async (content: string) => {
    if (!id || !replyTarget) return;
    await postAnswer({
      questionId: id,
      content,
      parentAnswerId: replyTarget.parentId
    });
    await refreshAnswers();
    toast.success('返信を投稿しました');
    setReplyTarget(null);
  };
  const handleDeleteQuestion = async () => {
    if (!id) return;
    try {
      await deleteQuestion(id);
      navigate('/top');
    } catch {
      toast.error('質問の削除に失敗しました。');
    }
  };

  // 回答・返信を削除
  const handleDeleteAnswer = async (answerId: string) => {
    try {
      await deleteAnswer(answerId);
      await refreshAnswers();
    } catch {
      toast.error('削除に失敗しました。');
    }
  };

  // ベストアンサーを採用
  const handleBestAnswer = async (answerId: string) => {
    try {
      const res = await acceptAnswer(answerId);
      setAnswers((prev) =>
        prev.map((a) => ({ ...a, isBestAnswer: a.id === answerId }))
      );
      setQuestion((prev) => prev ? { ...prev, statusId: '解決済み' } : prev);
      toast.success(res?.message || 'ベストアンサーに選びました');
    } catch (err) {
      console.error('ベストアンサー設定エラー:', err);
      toast.error('ベストアンサーの設定に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--base-color)] pt-[64px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[var(--base-color)] pt-[64px] flex items-center justify-center">
        <p className="text-[var(--dark-gray)]">質問が見つかりません</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--base-color)] pt-[64px]">
        <div className="max-w-[1440px] mx-auto px-[var(--spacing-32)] py-[var(--spacing-24)] flex flex-col gap-[var(--spacing-24)]">

          <QuestionDetailCard question={question} onDelete={handleDeleteQuestion} isOwner={isOwner} />

          <section className="flex flex-col gap-[var(--spacing-16)]">
            <div className="flex items-center justify-between border-b border-[var(--main-color)] py-[var(--spacing-16)]">
              <h2 className="text-[length:var(--font-size-big)]">回答一覧</h2>
            </div>

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
                    onReply={(answerId) => setReplyTarget({ parentId: answerId, type: 'answer', previewData: answer })}
                    onThreadReply={(preview) => setReplyTarget({ parentId: preview.id, type: 'thread', previewData: preview })}
                    onDeleteAnswer={handleDeleteAnswer}
                    onDeleteReply={handleDeleteAnswer}
                  />
                ))
              )}
            </ScrollBar>

            {!isOwner && question.statusId !== '解決済み' && (
              <div className='w-full flex items-center justify-center'>
                <Button onClick={() => setIsAnswerModalOpen(true)} text='回答作成' className='w-[410px]' />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 回答投稿モーダル */}
      {isAnswerModalOpen && (
        <AnswerFormModal
          title="回答を入力してください"
          submitText="回答送信"
          preview={<AnswererQuestionPreviewCard question={question} />}
          onClose={() => setIsAnswerModalOpen(false)}
          onSubmit={handlePostAnswer}
        />
      )}

      {/* 返信モーダル（回答向け・スレッド向け共通処理） */}
      {replyTarget && (
        <AnswerFormModal
          title="返信を入力してください"
          submitText="返信送信"
          preview={
            replyTarget.type === 'answer'
              ? <AnswerPreviewCard answer={replyTarget.previewData} />
              : <ReplyPreviewCard reply={replyTarget.previewData} />
          }
          onClose={() => setReplyTarget(null)}
          onSubmit={handlePostReply}
        />
      )}
    </>
  );
}