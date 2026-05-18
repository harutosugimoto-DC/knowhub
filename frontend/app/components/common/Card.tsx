import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
};

export default function Card({ children }: CardProps) {
    return (
        <div className="bg-white shadow-[var(--box-shadow)] rounded-[var(--radius-big)] p-4">
            {children}
        </div>
    );
}