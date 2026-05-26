export type AnswerReplyType = {
    id: number;
    iconURL: string;
    isLiked: boolean;
    userName: string;
    content: string;
    postingTime: string;
    likeCount: number;
    replyCount: number;
};

export type AnswerType = {
    id: number;
    iconURL: string;
    isLiked: boolean;
    userName: string;
    content: string;
    postingTime: string;
    likeCount: number;
    replyCount: number;
    isBestAnswer: boolean;
    replies?: AnswerReplyType[]; 
};