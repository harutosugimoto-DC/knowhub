import { checkIsTextOverflowing } from "@/utils/textUtils";
import { useEffect, useRef, useState } from "react";

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
    
    const [fullHeight, setFullHeight] = useState<number>(0);

    useEffect(() => {
        const checkLines = () => {
            if (!textRef.current) return;

            const originalMaxHeight = textRef.current.style.maxHeight;
            textRef.current.style.maxHeight = "none";

            const currentScrollHeight = textRef.current.scrollHeight;
            setFullHeight(currentScrollHeight);

            // 3行を超えているかを取得
            const overflowing = checkIsTextOverflowing(textRef.current, 3);

            // 判定が終わったら即座にスタイルを元に戻す
            textRef.current.style.maxHeight = originalMaxHeight;

            // 親コンポーネントに状態を通知
            setIsOverflowing(overflowing);

            // 3行以下（あふれていない）なら、強制的に「開いた状態」にする
            if (!overflowing) {
                setIsContentOpen(true);
            }
        };

        // 初回マウント時と状態変更時に実行
        checkLines();

        const handleResize = () => {
            checkLines();
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);

    }, [content, setIsContentOpen, setIsOverflowing]);
    const collapsedHeight = "calc(3em * 1.6 + var(--spacing-16))";

    return (
        <div className="relative">
            <p
                ref={textRef}
                className="!select-text whitespace-pre-wrap break-all px-[var(--spacing-16)] text-[length:var(--font-size-medium)] overflow-hidden transition-[max-height]"
                style={{
                    maxHeight: isContentOpen
                        ? `${fullHeight}px`
                        : collapsedHeight
                }}
            >
                {content}{isContentOpen ? '' : '・・・'}
            </p>
            <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white pointer-events-none transition-opacity"
                style={{ 
                    opacity: isContentOpen ? 0 : 1,
                    visibility: isContentOpen ? 'hidden' : 'visible'
                }}
            />
        </div>
    );
}