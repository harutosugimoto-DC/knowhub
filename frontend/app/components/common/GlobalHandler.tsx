import { useEffect, useState } from 'react';
import Toast from './Toast';

export default function GlobalHandler() {
    // ローディング状態を管理するstate
    const [isLoading, setIsLoading] = useState(false);

    // 表示中のトーストを配列で管理する（複数同時表示に対応）
    // id: トーストを個別に識別するための番号 / message: 表示するテキスト
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

    useEffect(() => {
        // axiosClientが投げた 'global-loading' イベントを受け取る
        const handleLoading = (e: Event) => {
            const customEvent = e as CustomEvent<boolean>;
            // trueならローディング開始、falseなら終了
            setIsLoading(customEvent.detail);
        };

        // axiosClientが投げた 'global-error' イベントを受け取る
        const handleApiError = (e: Event) => {
            const customEvent = e as CustomEvent<string>;

            // Date.now()で現在時刻（ミリ秒）を一意のIDとして使う
            const id = Date.now();

            // 既存のtoasts配列に新しいトーストを追加（前のトーストは消さない）
            setToasts(prev => [...prev, { id, message: customEvent.detail }]);

            // 3秒後にこのidのトーストだけを配列から削除する
            setTimeout(() => {
                // filter：id が一致しないものだけ残す = 該当トーストだけ消える
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };

        // イベントリスナーを登録
        window.addEventListener('global-loading', handleLoading);
        window.addEventListener('global-error', handleApiError);

        // コンポーネントがアンマウントされたときにリスナーを削除（メモリリーク防止）
        return () => {
            window.removeEventListener('global-loading', handleLoading);
            window.removeEventListener('global-error', handleApiError);
        };
    }, []); // []は「マウント時に1回だけ実行」という意味

    return (
        <>
            {/* ローディングUIは現在コメントアウト中 */}
            {/* {isLoading && (...)} */}

            {/* 画面右上・ヘッダー直下に固定表示するトーストエリア */}
            {/* flexDirection: column で複数トーストを縦に並べる */}
            <div style={{
                position: 'fixed',       // スクロールしても位置が固定
                top: '64px',             // ヘッダーの高さ分下げる
                right: '20px',           // 右端から20px内側
                zIndex: 9999,            // 他の要素より必ず手前に表示
                display: 'flex',         // 子要素（Toast）を並べるためのflex
                flexDirection: 'column', // 縦方向に並べる
                gap: '8px',              // トースト同士の間隔
            }}>
                {/* toasts配列をループして全トーストを表示 */}
                {/* key={toast.id} はReactが各要素を識別するために必須 */}
                {toasts.map(toast => (
                    <Toast key={toast.id} status={false} message={toast.message} />
                ))}
            </div>
        </>
    );
}