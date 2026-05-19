import FavoriteIcon from '@mui/icons-material/Favorite';
type LikeProps = {
    isLiked: boolean;
    count: number;
};

export default function Like({ isLiked, count }: LikeProps) {

    const handleClick = () => {

    }
    return (
        <div className='inline-flex items-center gap-1'>
            <FavoriteIcon
                className={`${isLiked ? 'text-[var(--like-color)]' : 'text-[var(--light-gray)]'}`}
                onClick={handleClick}
            />
            <span>{count}</span>
        </div>
    );
}