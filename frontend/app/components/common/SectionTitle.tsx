


type SectionTitleProps = {
    title: string;
    children?: React.ReactNode;
};
export default function SectionTitle({ title, children }: SectionTitleProps) {

    return (
        <div className="py-[var(--spacing-16)]">
            <div className="flex py-[var(--spacing-16)] justify-between items-center border-b border-[var(--main-color)]">
                <p className="font-[var(--font-size-big)]">{title}</p>
                {children}
            </div>
        </div>
    );
}