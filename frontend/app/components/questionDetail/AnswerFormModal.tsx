// src/components/questionDetail/AnswerFormModal.tsx

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import TextArea from '@/components/common/Textarea';
import ErrorMessages from '@/components/common/ErrorMessages';
import Button from '@/components/common/Button';

type AnswerFormModalProps = {
    title: string;
    preview: React.ReactNode;
    submitText: string;
    onClose: () => void;
    onSubmit: (content: string) => Promise<void>;
};

export default function AnswerFormModal({ title, preview, submitText, onClose, onSubmit }: AnswerFormModalProps) {
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('内容を入力してください');
            return;
        }
        if (content.length > 5000) {
            setError('文字数制限を超えています。5000文字以内で入力してください。');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit(content);
        } catch {
            setError('投稿に失敗しました。時間をおいて再度お試しください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal confirmOnClose onClose={onClose}>
            <div style={{ width: '750px', maxWidth: '90vw' }} className="flex flex-col max-h-[80vh] rounded-[var(--radius-big)] overflow-hidden">
                <div className="pt-4 px-4 shrink-0">
                    {preview}
                </div>
                <div className="flex flex-col gap-[var(--spacing-16)] px-4 pb-4 pt-2 items-center flex-1 overflow-y-auto">
                    <label className="w-full flex py-[var(--spacing-8)] justify-between items-center border-b border-[var(--main-color)] shrink-0">
                        <p className="text-[length:var(--font-size-big)]">
                            {title} <span className="text-[var(--danger-color)]">*</span>
                        </p>
                    </label>

                    <TextArea
                        placeholder="例：setStateによる更新は非同期で行われるため、同じレンダーサイクル内では古い値を参照してしまうからです。"
                        value={content}
                        onChange={setContent}
                        rows={5}
                    />

                    {error && <ErrorMessages message={error} />}

                    <Button
                        className='w-[344px] shrink-0'
                        onClick={handleSubmit}
                        text={isSubmitting ? '送信中...' : submitText}
                        disabled={isSubmitting}
                    />
                </div>
            </div>
        </Modal>
    );
}