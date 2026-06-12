import { useEffect, useState } from 'react';
import { getAdminTags, createAdminTag, deleteAdminTag } from '@/api/adminService';
import type { AdminTag } from '@/types/admin';
import TextInput from '@/components/common/TextInput';
import Modal from '@/components/common/Modal';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import AddIcon from '@mui/icons-material/Add';

export default function AdminTags() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminTag | null>(null);

  const loadTags = async () => {
    try {
      setTags(await getAdminTags());
    } catch { /* axiosClient handles errors */ }
  };

  useEffect(() => { loadTags(); }, []);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      await createAdminTag(newTagName);
      setNewTagName('');
      loadTags();
    } catch { /* axiosClient handles errors */ }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminTag(deleteTarget.id);
      setDeleteTarget(null);
      loadTags();
    } catch { setDeleteTarget(null); }
  };

  return (
    <div>
      <h2 className="text-[length:var(--font-size-big)] font-bold mb-6">タグ管理</h2>

      {/* 新規作成フォーム */}
      <div className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)] p-6 mb-6">
        <h3 className="text-[length:var(--font-size-medium)] font-medium mb-4">新規タグ作成</h3>
        <div className="flex gap-4 items-center">
          <div className="w-72">
            <TextInput
              placeholder="タグ名（1〜20文字）"
              value={newTagName}
              onChange={setNewTagName}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTagName.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-[image:var(--gradation-green)] text-white rounded-[var(--radius-small)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <AddIcon className="!text-[18px]" />
            作成する
          </button>
        </div>
      </div>

      {/* タグ一覧 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)] p-4 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <LabelIcon className="!text-[18px] text-[var(--main-color)] flex-shrink-0" />
              <span className="font-medium truncate">{tag.name}</span>
              <span className="text-xs text-[var(--dark-gray)] flex-shrink-0">({tag.questionCount})</span>
            </div>
            <button
              onClick={() => setDeleteTarget(tag)}
              disabled={tag.questionCount > 0}
              title={tag.questionCount > 0 ? `${tag.questionCount}件の質問で使用中` : 'タグを削除'}
              className="p-1 text-[var(--danger-color)] hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <DeleteIcon className="!text-[18px]" />
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--dark-gray)]">
            タグがありません
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="text-center w-full">
            <p className="text-[length:var(--font-size-medium)] font-bold mb-4">タグを削除しますか？</p>
            <p className="text-[var(--dark-gray)] mb-8">
              「<strong>{deleteTarget.name}</strong>」を削除します。
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setDeleteTarget(null)}
                className="px-8 py-3 rounded-[var(--radius-small)] border border-[var(--light-gray)] hover:bg-gray-50 transition-colors">
                キャンセル
              </button>
              <button onClick={handleDeleteConfirm}
                className="px-8 py-3 rounded-[var(--radius-small)] bg-[var(--danger-color)] text-white font-medium hover:opacity-90 transition-opacity">
                削除する
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
