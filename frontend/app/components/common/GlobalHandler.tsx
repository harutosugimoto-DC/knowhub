import { useEffect, useState } from 'react';
import Toast from './Toast';

export default function GlobalHandler() {
    // ローディング状態を管理するstate
    const [isLoading, setIsLoading] = useState(false);

    // エラートースト（赤）の配列
    const [errorToasts, setErrorToasts] = useState<{ id: number; message: string }[]>([]);

    // 成功トースト（緑）の配列
    const [successToasts, setSuccessToasts] = useState<{ id: number; message: string }[]>([]);

    useEffect(() => {
        // ローディングイベントを受け取る
        const handleLoading = (e: Event) => {
            const customEvent = e as CustomEvent<boolean>;
            setIsLoading(customEvent.detail);
        };

        // axiosClientが投げたエラーイベントを受け取る
        const handleApiError = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const id = Date.now();

            // エラートースト配列に追加
            setErrorToasts(prev => [...prev, { id, message: customEvent.detail }]);

            // 3秒後にそのIDのトーストだけ削除
            setTimeout(() => {
                setErrorToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        // 各コンポーネントが投げた成功イベントを受け取る
        const handleApiSuccess = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const id = Date.now();

            // 成功トースト配列に追加
            setSuccessToasts(prev => [...prev, { id, message: customEvent.detail }]);

            // 3秒後にそのIDのトーストだけ削除
            setTimeout(() => {
                setSuccessToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        // イベントリスナーを登録
        window.addEventListener('global-loading', handleLoading);
        window.addEventListener('global-error', handleApiError);
        window.addEventListener('global-success', handleApiSuccess); // 成功イベントを追加

        // コンポーネントがアンマウントされたときにリスナーを削除
        return () => {
            window.removeEventListener('global-loading', handleLoading);
            window.removeEventListener('global-error', handleApiError);
            window.removeEventListener('global-success', handleApiSuccess);
        };
    }, []);

    return (
        <>
            {/* ローディングUIは現在コメントアウト中 */}
            {/* {isLoading && (...)} */}

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
