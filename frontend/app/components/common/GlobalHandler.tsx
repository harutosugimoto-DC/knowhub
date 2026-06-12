import { useEffect, useState } from 'react';
import Toast from './Toast';

export default function GlobalHandler() {

    const [errorToasts, setErrorToasts] = useState<{ id: number; message: string }[]>([]);

    const [successToasts, setSuccessToasts] = useState<{ id: number; message: string }[]>([]);

    useEffect(() => {
        

        // axiosClientが投げたエラーイベントを受け取る
        const handleApiError = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const id = Date.now();

            setErrorToasts(prev => [...prev, { id, message: customEvent.detail }]);

            setTimeout(() => {
                setErrorToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        // 各コンポーネントが投げた成功イベントを受け取る
        const handleApiSuccess = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const id = Date.now();

            setSuccessToasts(prev => [...prev, { id, message: customEvent.detail }]);

            setTimeout(() => {
                setSuccessToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        window.addEventListener('global-error', handleApiError);
        window.addEventListener('global-success', handleApiSuccess);

        return () => {
            window.removeEventListener('global-error', handleApiError);
            window.removeEventListener('global-success', handleApiSuccess);
        };
    }, []);

    return (
        <>
            {/* トースト表示エリア：ヘッダー直下・右上に固定 */}
            <div style={{
                position: 'fixed',
                top: '64px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {/* 成功トースト（緑）：status=true */}
                {successToasts.map(toast => (
                    <Toast key={toast.id} status={true} message={toast.message} />
                ))}

                {/* エラートースト（赤）：status=false */}
                {errorToasts.map(toast => (
                    <Toast key={toast.id} status={false} message={toast.message} />
                ))}
            </div>
        </>
    );
}
