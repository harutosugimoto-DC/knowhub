import FavoriteIcon from '@mui/icons-material/Favorite';
import { useEffect, useState } from 'react';
import { addLike, removeLike } from '@/api/questionService';
import answerService from '@/api/answerService'; 

type LikeProps = {
    isLiked: boolean;
    count: number;
    id: number;
    type: "question" | "answer";
};

export default function Like({ isLiked, count, id, type }: LikeProps) {
    const [likedState, setLikedState] = useState(isLiked);
    const [countState, setCountState] = useState(count);
    const [isPending, setIsPending] = useState(false); // 連打防止フラグ

    useEffect(() => {
        setLikedState(isLiked);
        setCountState(count);
    }, [isLiked, count]);

    const handleClick = async () => {
        if (isPending) return; // 通信中はクリックを無視（連打対策）

        // 先に見ための状態をトグルする
        const nextLiked = !likedState;
        setLikedState(nextLiked);
        setCountState((prev) => nextLiked ? prev + 1 : prev - 1);

        try {
            setIsPending(true);

            // type に応じてAPIの処理を切り替え
            if (type === "question") {
                if (nextLiked) {
                    await addLike(id);
                } else {
                    await removeLike(id);
                }
            } else if (type === "answer") {
                if (nextLiked) {
                    await answerService.addAnswerLike(id);
                } else {
                    await answerService.removeAnswerLike(id);
                }
            }
        } catch (error) {
            console.error(`${type}のいいね操作に失敗しました:`, error);
            // ❌ APIが失敗した場合は、ステートを元の状態に巻き戻す
            setLikedState(likedState);
            setCountState(countState);
            alert("操作に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className='inline-flex items-center gap-1'>
            <FavoriteIcon
                className={`cursor-pointer transition-colors ${
                    likedState ? 'text-[var(--like-color)]' : 'text-[var(--light-gray)]'
                } ${isPending ? 'opacity-50 Fpointer-events-none' : ''}`}
                onClick={handleClick}
            />
            <span>{countState}</span>
        </div>
    );
}