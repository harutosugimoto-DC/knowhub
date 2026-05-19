import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export default function Card({ children, className }: CardProps) {
    return (
        <div className={`bg-white shadow-[var(--box-shadow)] rounded-[var(--radius-big)] p-4 ${className || ""}`}>
            {children}
        </div>
    );
}