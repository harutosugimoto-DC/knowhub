export type QuestionType = {
    id:number,
    title: string;
    iconURL:string;
    statusId: number;
    isLiked: boolean;
    isBookmarked: boolean;
    userName: string;
    postingTime: string;
    likeCount: number;
    bookmarkCount: number;
    replyCount: number;
    tagNames: string[];
};