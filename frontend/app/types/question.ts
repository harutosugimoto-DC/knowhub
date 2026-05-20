export type QuestionType = {
    title: string;
    statusId: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    userName: string;
    postingTime: Date;
    likeCount: number;
    bookmarkCount: number;
    replyCount: number;
    tagNames: string[];
    userAvatarUrl?: string;
};