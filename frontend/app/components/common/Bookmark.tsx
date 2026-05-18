import BookmarkIcon from '@mui/icons-material/Bookmark';
type BookmarkProps = {
    isChecked: boolean;
    count: number;
};

export default function Bookmark({ isChecked, count }: BookmarkProps) {

    return (
        <div className='inline-flex items-center gap-1 height-[28px]'>
            <BookmarkIcon className={`${isChecked ? 'text-[var(--main-color)]' : 'text-[var(--light-gray)]'}`} />
            <span>{count}</span>
        </div>
    );
}