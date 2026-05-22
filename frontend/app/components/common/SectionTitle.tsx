


type SectionTitleProps = {
    title: string;
    isRequired?: boolean
    isTagSelect?: boolean
    children?: React.ReactNode;
};
export default function SectionTitle({ title, children, isRequired, isTagSelect }: SectionTitleProps) {

    return (
        <div className="flex py-[var(--spacing-16)] justify-between items-center border-b border-[var(--main-color)]">
            <p className="text-[length:var(--font-size-big)]">
                {title}
                {isRequired && <span className="text-[var(--danger-color)]">*</span>}
                {isTagSelect && <span className="pl-2 text-[12px] text-[var(--dark-gray)]">(最大5つ)</span>}
            </p>
            {children}
        </div>
    );
}