
type ButtonProps = {
    text: string;
    onClick: () => void;
};

export default function Button({ text, onClick }: ButtonProps) {

    return (
        <button onClick={()=>onClick()} className="shadow-[var(--box-shadow)] inline-block px-[var(--spacing-128)] py-[var(--spacing-16)] bg-[image:var(--gradation-green)] text-white rounded-[var(--radius-small)] cursor-pointer">
            {text}
        </button>
    );
}