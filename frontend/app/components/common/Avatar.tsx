type AvatarProps = {
    //サイズは親要素で制御する
    className?: string;
}

export default function Avatar({ className = "" }: AvatarProps) {
    const src = "https://t.pimg.jp/032/347/737/1/32347737.jpg";
    const alt = "ユーザーのアバター";
    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 border-[1.5px] border-[var(--main-color)] ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
    );
}