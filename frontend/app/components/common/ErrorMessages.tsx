// app/components/common/ErrorMessages.tsx

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

type Props = {
  message: string;
};

const ErrorMessages = ({ message }: Props) => {

  // messageが空のときは何も表示しない
  if (!message) return null;

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
      className="bg-red-50 border-2 border-l-[4px] border-[var(--danger-color)] rounded-[var(--radius-small)] px-3 py-3"
    //className="bg-red-50 border border-[var(--danger-color)] rounded-[var(--radius-small)] px-3 py-3"
    >
      {/* 警告アイコン：UIに固定。propsで変更不可 */}
      <ReportProblemOutlinedIcon
        style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger-color)' }}
        fontSize="small"
      />

      {/* エラーメッセージ一覧：バックエンドから渡された内容を表示 */}
      <div className="flex flex-col gap-1">
        <p
          className="text-sm leading-snug text-[var(--danger-color)]"
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessages;