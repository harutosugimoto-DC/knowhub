type AvatarProps = {
    //サイズは親要素で制御する
    src:string;
    className?: string;
}

export default function Avatar({src, className = "" }: AvatarProps) {
    const alt = "ユーザーのアバター";
    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-[var(--main-color)] ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
    );
}