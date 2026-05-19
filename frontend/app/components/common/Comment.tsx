import ModeCommentIcon from '@mui/icons-material/ModeComment';
type CommentProps = {
    count: number;
};

export default function Comment({ count }: CommentProps) {

    return (
        <div className='inline-flex items-center gap-1'>
            <ModeCommentIcon className='text-[var(--light-gray)] translate-y-[1px]' />
            <span>{count}</span>
        </div>
    );
}