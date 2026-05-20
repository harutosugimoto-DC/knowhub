import { useEffect, useRef } from "react";

type CollapsibleContentProps = {
    content: string;
    isContentOpen: boolean;
    setIsContentOpen: (isOpen: boolean) => void;
};

export default function CollapsibleContent({ 
    content, 
    isContentOpen, 
    setIsContentOpen 
}: CollapsibleContentProps) {
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const checkLines = () => {
            if (textRef.current) {
                const el = textRef.current;
                const computedStyle = window.getComputedStyle(el);

                let lineHeight = parseFloat(computedStyle.lineHeight);
                if (isNaN(lineHeight)) {
                    lineHeight = parseFloat(computedStyle.fontSize) * 1.5;
                }

                const paddingTop = parseFloat(computedStyle.paddingTop);
                const paddingBottom = parseFloat(computedStyle.paddingBottom);
                const contentHeight = el.scrollHeight - paddingTop - paddingBottom;
                const threeLinesHeight = lineHeight * 3;

                if (contentHeight > threeLinesHeight) {
                    setIsContentOpen(false); // 3行以上なら閉じる
                } else {
                    setIsContentOpen(true);
                }
            }
        };

        // 初回マウント時と content 変更時に実行
        checkLines();

        const handleResize = () => {
            if(isContentOpen) return; // コンテンツが開いている場合は高さの再計算は不要
            checkLines(); 
        };
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
        
    }, [content]); // contentが変更された時のみ高さを再計算する

    return (
        <div className="relative">
            <p 
                ref={textRef} 
                className={`px-[var(--spacing-16)] py-[var(--spacing-8)] text-[length:var(--font-size-medium)] transition-all duration-300 ${!isContentOpen ? "max-h-[calc(3em*1.6+var(--spacing-16))] overflow-hidden" : ""}`}
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