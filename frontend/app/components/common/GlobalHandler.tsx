import { useEffect, useState } from 'react';
import Toast from './Toast';

export default function GlobalHandler() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // Axiosからのローディングの合図をキャッチ
        const handleLoading = (e: Event) => {
            const customEvent = e as CustomEvent<boolean>;
            setIsLoading(customEvent.detail);
        };

        // Axiosからのエラーの合図をキャッチ
        const handleApiError = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            setErrorMessage(customEvent.detail);
            
            // 3秒後に自動でエラーメッセージを消す
            setTimeout(() => setErrorMessage(null), 3000);
        };

        window.addEventListener('global-loading', handleLoading);
        window.addEventListener('global-error', handleApiError);

        return () => {
            window.removeEventListener('global-loading', handleLoading);
            window.removeEventListener('global-error', handleApiError);
        };
    }, []);

    return (
        <>
            {/* {isLoading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 9999, color: 'white', fontSize: '20px'
                }}>
                    読み込み中...
                </div>
            )} */}

            {/* 🟢 エラートースト通知 */}
            {errorMessage && (
                <div></div>
                // <Toast status={false} text={errorMessage}/>
            )}
        </>
    );
}