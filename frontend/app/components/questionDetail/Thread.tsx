


type ThreadProps = {
    userName: string;
    content: string;
    postingTime: Date;
    likeCount: number;
    replyCount: number;
    isBestAnswer: boolean;

};
export default function Thread({ userName, content, postingTime, likeCount, replyCount, isBestAnswer }: ThreadProps) {

    return (
        <div >
        </div>
    );
}