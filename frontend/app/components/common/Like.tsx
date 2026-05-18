import FavoriteIcon from '@mui/icons-material/Favorite';
type LikeProps = {
    isChecked: boolean;
    count: number;
};

export default function Like({ isChecked, count }: LikeProps) {

    return (
        <div className='inline-flex items-center gap-1'>
            <FavoriteIcon className={`${isChecked ? 'text-[var(--like-color)]' : 'text-[var(--light-gray)]'}`} />
            <span>{count}</span>
        </div>
    );
}