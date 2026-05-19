import BookmarkIcon from '@mui/icons-material/Bookmark';
type BookmarkProps = {
    isBookmarked: boolean;
    count: number;
};

export default function Bookmark({ isBookmarked, count }: BookmarkProps) {

    const handleClick = () => {
        
    }

    return (
        <div className='inline-flex items-center gap-1'>
            <BookmarkIcon
                className={`${isBookmarked ? 'text-[var(--main-color)]' : 'text-[var(--light-gray)]'}`}
                onClick={handleClick}
            />
            <span>{count}</span>
        </div>
    );
}