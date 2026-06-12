import { useEffect, useState } from 'react';
import Avatar from '@/components/common/Avatar';
import Modal from '@/components/common/Modal';
import TextInput from '@/components/common/TextInput';
import { getAdminUsers, getAdminUserDetail, deleteAdminUser, toggleAdminRole } from '@/api/adminService';
import type { AdminUser, AdminUserDetail } from '@/types/admin';
import { useUser } from '@/contexts/UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

export default function AdminUsers() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const loadUsers = async (page: number, q: string) => {
    try {
      const result = await getAdminUsers(page, q || undefined);
      setUsers(result.data);
      setTotalPages(result.totalPages || 1);
    } catch { /* axiosClient handles errors */ }
  };

  useEffect(() => { loadUsers(currentPage, search); }, [currentPage, search]);

  const handleSearch = () => { setCurrentPage(1); setSearch(searchInput); };

  const openDetail = async (user: AdminUser) => {
    setSelectedUser(user);
    setUserDetail(null);
    try {
      const detail = await getAdminUserDetail(user.id);
      setUserDetail(detail);
    } catch { /* axiosClient handles errors */ }
  };

  const handleToggleAdmin = async (userId: string, newIsAdmin: boolean) => {
    try {
      await toggleAdminRole(userId, newIsAdmin);
      const update = (u: AdminUser) => u.id === userId ? { ...u, isAdmin: newIsAdmin } : u;
      setUsers(prev => prev.map(update));
      setSelectedUser(prev => prev && prev.id === userId ? { ...prev, isAdmin: newIsAdmin } : prev);
      setUserDetail(prev => prev && prev.id === userId ? { ...prev, isAdmin: newIsAdmin } : prev);
    } catch { /* axiosClient handles errors */ }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminUser(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedUser(null);
      setUserDetail(null);
      loadUsers(currentPage, search);
    } catch { setDeleteTarget(null); }
  };

  return (
    <div>
      <h2 className="text-[length:var(--font-size-big)] font-bold mb-6">ユーザー管理</h2>

      <div className="w-80 mb-6">
        <TextInput
          placeholder="ニックネームで検索..."
          value={searchInput}
          onChange={setSearchInput}
          isSearch
          onSearch={handleSearch}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <div className="bg-white rounded-[var(--radius-big)] shadow-[var(--box-shadow)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--hover-color)] border-b border-[var(--light-gray)]">
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">ユーザー</th>
              <th className="text-center px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">質問数</th>
              <th className="text-center px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">回答数</th>
              <th className="text-center px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">権限</th>
              <th className="text-left px-4 py-3 text-sm text-[var(--dark-gray)] font-medium">登録日</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr
                key={user.id}
                className="border-b border-[var(--light-gray)] hover:bg-[var(--hover-color)] transition-colors cursor-pointer"
                onClick={() => openDetail(user)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.iconUrl} className="w-9 h-9" />
                    <span className="font-medium">{user.nickname ?? '(未設定)'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{user.questionCount}</td>
                <td className="px-4 py-3 text-center">{user.answerCount}</td>
                <td className="px-4 py-3 text-center">
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--main-color)] text-white text-xs rounded-full">
                      <AdminPanelSettingsIcon className="!text-[12px]" />
                      管理者
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--dark-gray)] text-sm">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3" onClick={e => { e.stopPropagation(); setDeleteTarget(user); }}>
                  <button
                    disabled={user.id === currentUser?.id}
                    className="p-2 text-[var(--danger-color)] hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <DeleteIcon className="!text-[20px]" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--dark-gray)]">
                  ユーザーが見つかりません
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

      {/* ユーザー詳細モーダル */}
      {selectedUser && (
        <Modal onClose={() => { setSelectedUser(null); setUserDetail(null); }}>
          <div className="w-full">
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={selectedUser.iconUrl} className="w-16 h-16" />
              <div>
                <h3 className="text-[length:var(--font-size-medium)] font-bold">
                  {selectedUser.nickname ?? '(未設定)'}
                </h3>
                <p className="text-sm text-[var(--dark-gray)] mt-1">登録日: {formatDate(selectedUser.createdAt)}</p>
                {selectedUser.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--main-color)] text-white text-xs rounded-full mt-1">
                    <AdminPanelSettingsIcon className="!text-[12px]" />
                    管理者
                  </span>
                )}
              </div>
            </div>

            {userDetail && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: '質問数', value: userDetail.questionCount },
                  { label: '回答数', value: userDetail.answerCount },
                  { label: 'ベストアンサー', value: userDetail.bestAnswerCount },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--hover-color)] rounded-[var(--radius-small)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--main-color)]">{value}</p>
                    <p className="text-sm text-[var(--dark-gray)] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {currentUser?.id !== selectedUser.id && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleToggleAdmin(selectedUser.id, !selectedUser.isAdmin)}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-small)] border-2 font-medium transition-colors ${
                    selectedUser.isAdmin
                      ? 'border-[var(--dark-gray)] text-[var(--dark-gray)] hover:bg-gray-50'
                      : 'border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--hover-color)]'
                  }`}
                >
                  <AdminPanelSettingsIcon />
                  {selectedUser.isAdmin ? '管理者権限を剥奪する' : '管理者権限を付与する'}
                </button>
                <button
                  onClick={() => { setDeleteTarget(selectedUser); setSelectedUser(null); setUserDetail(null); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-small)] border-2 border-[var(--danger-color)] text-[var(--danger-color)] font-medium hover:bg-red-50 transition-colors"
                >
                  <DeleteIcon />
                  このユーザーを削除する
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="text-center w-full">
            <p className="text-[length:var(--font-size-medium)] font-bold mb-4">ユーザーを削除しますか？</p>
            <p className="text-[var(--dark-gray)] mb-2">
              <strong>{deleteTarget.nickname ?? '(未設定)'}</strong> を完全に削除します。
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
