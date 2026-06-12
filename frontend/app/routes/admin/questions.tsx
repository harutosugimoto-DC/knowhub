import { useEffect, useState } from 'react';
import { getAdminQuestions, deleteAdminQuestion } from '@/api/adminService';
import type { AdminQuestion } from '@/types/admin';
import StatusChip from '@/components/common/StatusChip';
import TagChip from '@/components/common/TagChip';
import TextInput from '@/components/common/TextInput';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null);

  const loadQuestions = async (page: number, kw: string) => {
    try {
      const result = await getAdminQuestions(page, kw || undefined);
      setQuestions(result.data);
      setTotalPages(result.totalPages || 1);
    } catch { /* axiosClient handles errors */ }
  };

  useEffect(() => { loadQuestions(currentPage, keyword); }, [currentPage, keyword]);

  const handleSearch = () => { setCurrentPage(1); setKeyword(keywordInput); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminQuestion(deleteTarget.id);
      setDeleteTarget(null);
      loadQuestions(currentPage, keyword);
    } catch { setDeleteTarget(null); }
  };

  return (
    <div>
      <h2 className="text-[length:var(--font-size-big)] font-bold mb-6">質問管理</h2>

      <div className="w-80 mb-6">
        <TextInput
          placeholder="タイトルで検索..."
          value={keywordInput}
          onChange={setKeywordInput}
          isSearch
          onSearch={handleSearch}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <div className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--hover-color)] border-b border-[var(--light-gray)]">
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">タイトル</th>
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">投稿者</th>
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">ステータス</th>
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">タグ</th>
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">投稿日</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id} className="border-b border-[var(--light-gray)] hover:bg-[var(--hover-color)] transition-colors">
                <td className="px-4 py-3 max-w-[240px]">
                  <span className="line-clamp-2 text-sm">{q.title}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={q.iconUrl} className="w-7 h-7" />
                    <span className="text-sm">{q.userName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusChip name={q.statusId} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {q.tagNames.slice(0, 2).map(tag => (
                      <TagChip key={tag} text={tag} />
                    ))}
                    {q.tagNames.length > 2 && (
                      <span className="text-xs text-[var(--dark-gray)] self-center">+{q.tagNames.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--dark-gray)] whitespace-nowrap">
                  {formatDate(q.postingTime)}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteTarget(q)}
                    className="p-2 text-[var(--danger-color)] hover:bg-red-50 rounded transition-colors">
                    <DeleteIcon className="!text-[20px]" />
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--dark-gray)]">
                  質問が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 rounded hover:bg-[var(--hover-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <NavigateBeforeIcon />
          </button>
          <span className="text-sm text-[var(--dark-gray)]">{currentPage} / {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 rounded hover:bg-[var(--hover-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <NavigateNextIcon />
          </button>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="text-center w-full">
            <p className="text-[length:var(--font-size-medium)] font-bold mb-4">質問を削除しますか？</p>
            <p className="text-[var(--dark-gray)] mb-2 text-sm">
              「<strong>{deleteTarget.title}</strong>」を削除します。
            </p>
            <p className="text-[var(--danger-color)] text-sm mb-8">この操作は取り消せません。</p>
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
