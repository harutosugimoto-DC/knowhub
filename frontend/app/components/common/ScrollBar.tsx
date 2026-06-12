import type { ReactNode, Ref } from "react";

type ScrollBarProps = {
    children: ReactNode;
    className?: string;
    isAi?: boolean
    ref?: Ref<HTMLDivElement>
};

export default function ScrollBar({ children, className = "", isAi, ref }: ScrollBarProps) {
    return (
        <div
            ref={ref}
            // 配列でクラスを並べて、最後に .join(" ") で半角スペース繋ぎの1つの文字列にします
            className={[
                "pr-[var(--spacing-8)]",
                "overflow-auto",

                // スクロールバー全体の幅と高さ
                "[&::-webkit-scrollbar]:w-1",
                "[&::-webkit-scrollbar]:h-1",

                // スクロールバーの軌道（トラック）の背景色
                "[&::-webkit-scrollbar-track]:bg-[var(--light-gray)]",
                "[&::-webkit-scrollbar-track]:rounded-full",

                // スクロールバーの動く部分（サム）のデザイン
                isAi
                    ? "[&::-webkit-scrollbar-thumb]:bg-[image:var(--ai-color)]"
                    : "[&::-webkit-scrollbar-thumb]:bg-[var(--main-color)]",
                "[&::-webkit-scrollbar-thumb]:rounded-full",

                // つまみにホバーした時に色を濃くする
                "hover:[&::-webkit-scrollbar-thumb]:bg-[var(--accent-color)]",

                className
            ].join(" ")}
        >
            {children}
        </div>
    );
}