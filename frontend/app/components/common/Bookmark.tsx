import BookmarkIcon from '@mui/icons-material/Bookmark';
import { addBookmark, removeBookmark } from '@/api/questionService';
import { useEffect, useState } from 'react';

type BookmarkProps = {
    isBookmarked: boolean;
    count: number;
    id: number
};

export default function Bookmark({ isBookmarked, count, id }: BookmarkProps) {

    const [bookmarkedState, setBookmarkedState] = useState(isBookmarked);
    const [countState, setCountState] = useState(count);
    const [isPending, setIsPending] = useState(false); // 連打防止フラグ

    useEffect(() => {
        setBookmarkedState(isBookmarked);
        setCountState(count);
    }, [isBookmarked, count]);

    const handleClick = async () => {
        if (isPending) return; // 通信中はクリックを無視（連打対策）

        // 先に見ための状態をトグルする
        const nextBookmarked = !bookmarkedState;
        setBookmarkedState(nextBookmarked);
        setCountState((prev) => nextBookmarked ? prev + 1 : prev - 1);

        try {
            setIsPending(true);

            // 状態に応じてAPIを呼び分け
            if (nextBookmarked) {
                await addBookmark(id);
            } else {
                await removeBookmark(id);
            }
        } catch (error) {
            console.error('ブックマーク操作に失敗しました:', error);
            // ❌ APIが失敗した場合は、ステートを元の状態に巻き戻す
            setBookmarkedState(bookmarkedState);
            setCountState(countState);
            alert("操作に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setIsPending(false);
        }
    }
    useEffect(() => {

    }, [])
    return (
        <div className='inline-flex items-center gap-1'>
            <BookmarkIcon
                className={`cursor-pointer transition-colors ${bookmarkedState ? 'text-[var(--main-color)]' : 'text-[var(--light-gray)]'
                    } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={handleClick}
            />
            <span>{countState}</span>
        </div>
    );
}