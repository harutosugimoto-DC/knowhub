import { checkIsTextOverflowing } from "@/utils/textUtils";
import { useEffect, useRef } from "react";

type CollapsibleContentProps = {
    content: string;
    isContentOpen: boolean;
    setIsContentOpen: (isOpen: boolean) => void;
    setIsOverflowing: (isOverflowing: boolean) => void;
};

export default function CollapsibleContent({
    content,
    isContentOpen,
    setIsContentOpen,
    setIsOverflowing
}: CollapsibleContentProps) {
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const checkLines = () => {
            if (!textRef.current) return;

            // 💡 修正点1: 判定の瞬間だけ maxHeight の制限を一時的に解除する
            const originalMaxHeight = textRef.current.style.maxHeight;
            textRef.current.style.maxHeight = "none";

            // 制限がない本来のフルサイズ状態で、3行を超えているかを取得
            const overflowing = checkIsTextOverflowing(textRef.current, 3);

            // 💡 修正点2: 判定が終わったら即座にスタイルを元に戻す（描画のガタつきは起きません）
            textRef.current.style.maxHeight = originalMaxHeight;

            // 親コンポーネントに状態を通知
            setIsOverflowing(overflowing);

            // 3行以下（あふれていない）なら、強制的に「開いた状態」にする
            if (!overflowing) {
                setIsContentOpen(true);
            } else if (!isContentOpen) {
                setIsContentOpen(false);
            }
        };

        // 初回マウント時と状態変更時に実行
        checkLines();

        const handleResize = () => {
            checkLines();
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);

    }, [content, isContentOpen]);

    return (
        <div className="relative">
            <p
                ref={textRef}
                className="!select-text whitespace-pre-wrap break-all px-[var(--spacing-16)] text-[length:var(--font-size-medium)] transition-all overflow-hidden"
                style={{
                    maxHeight: isContentOpen
                        ? `${textRef.current?.scrollHeight ?? 1000}px` // 開いている時は実際の全高(px)
                        : "calc(3em * 1.6 + var(--spacing-16))"       // 閉じている時は元の3行分の高さ
                }}
            >
                {content}{isContentOpen ? '' : '・・・'}
            </p>
            <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white pointer-events-none"
                style={{ display: isContentOpen ? 'none' : 'block' }}
            />
        </div>
    );
}