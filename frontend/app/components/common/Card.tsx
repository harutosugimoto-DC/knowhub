import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export default function Card({ children, className, onClick }: CardProps) {
    return (
        <div className={`bg-white shadow-[var(--box-shadow)] rounded-[var(--radius-big)] p-4 ${className || ""}`} onClick={onClick}>
            {children}
        </div>
    );
}