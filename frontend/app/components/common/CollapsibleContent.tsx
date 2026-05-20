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
            // utilsを使って、3行を超えているか(true/false)を取得
            const overflowing = checkIsTextOverflowing(textRef.current, 3);

            // 親コンポーネントに状態を通知
            setIsOverflowing(overflowing);

            // 3行以下（あふれていない）なら、強制的に「開いた状態」にする
            if (!overflowing) {
                setIsContentOpen(true);
            } else if (!isContentOpen) {
                // はじめてあふれた判定になった時は閉じておく（要件に合わせて調整可）
                setIsContentOpen(false);
            }
        };

        // 初回マウント時と content 変更時に実行
        checkLines();

        const handleResize = () => {
            if (isContentOpen) return; // コンテンツが開いている場合は高さの再計算は不要
            checkLines();
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);

    }, [content]); // contentが変更された時のみ高さを再計算する

    return (
        <div className="relative">
            <p
                ref={textRef}
                className={`px-[var(--spacing-16)] text-[length:var(--font-size-medium)] transition-all duration-300 ${!isContentOpen ? "max-h-[calc(3em*1.6+var(--spacing-16))] overflow-hidden" : ""}`}
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