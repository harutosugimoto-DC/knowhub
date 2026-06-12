import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import { getAdminStats } from '@/api/adminService';
import type { AdminStats } from '@/types/admin';
import PeopleIcon from '@mui/icons-material/People';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LabelIcon from '@mui/icons-material/Label';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
  }, []);

  const statItems = [
    { label: '総ユーザー数', value: stats?.userCount, icon: PeopleIcon, color: 'var(--main-color)' },
    { label: '総質問数', value: stats?.questionCount, icon: QuestionAnswerIcon, color: 'var(--accent-color)' },
    { label: '総タグ数', value: stats?.tagCount, icon: LabelIcon, color: 'var(--status-color-organize)' },
  ];

  return (
    <div>
      <h2 className="text-[length:var(--font-size-big)] font-bold mb-8">ダッシュボード</h2>
      <div className="grid grid-cols-3 gap-6">
        {statItems.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-6 !p-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color + '20' }}
            >
              <Icon style={{ color, fontSize: 28 }} />
            </div>
            <div>
              <p className="text-[var(--dark-gray)] text-sm">{label}</p>
              <p className="text-[length:var(--font-size-big)] font-bold mt-1">
                {value ?? '—'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
