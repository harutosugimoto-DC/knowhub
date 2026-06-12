import { NavLink, Outlet, redirect } from 'react-router';
import { getMyData } from '@/api/userService';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LabelIcon from '@mui/icons-material/Label';

export async function clientLoader() {
  try {
    const userData = await getMyData();
    if (!userData.isAdmin) {
      return redirect('/top');
    }
    return null;
  } catch {
    return redirect('/top');
  }
}

const navItems = [
  { to: '/admin', label: 'ダッシュボード', icon: DashboardIcon, end: true },
  { to: '/admin/users', label: 'ユーザー管理', icon: PeopleIcon, end: false },
  { to: '/admin/questions', label: '質問管理', icon: QuestionAnswerIcon, end: false },
  { to: '/admin/tags', label: 'タグ管理', icon: LabelIcon, end: false },
];

export default function AdminLayout() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-56 bg-white shadow-[var(--box-shadow)] flex-shrink-0 flex flex-col overflow-y-auto">
        <div className="px-5 py-5 border-b border-[var(--light-gray)]">
          <p className="text-xs text-[var(--dark-gray)] mb-1">KnowHub</p>
          <h1 className="text-[length:var(--font-size-medium)] font-bold text-[var(--main-color)]">管理画面</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-small)] text-[length:var(--font-size-normal)] transition-colors ${
                  isActive
                    ? 'bg-[var(--main-color)] text-white'
                    : 'text-[var(--text-color-black)] hover:bg-[var(--hover-color)]'
                }`
              }
            >
              <Icon className="!text-[20px]" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--base-color)] p-8">
        <Outlet />
      </main>
    </div>
  );
}
