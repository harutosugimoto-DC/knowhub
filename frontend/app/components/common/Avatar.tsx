type AvatarProps = {
    src: string;
    alt?: string;
    //サイズは親要素で制御する
    className?: string;
}

export default function Avatar({ src, alt = "Avatar", className = "" }: AvatarProps) {
    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-[var(--main-color)] ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
    );
}