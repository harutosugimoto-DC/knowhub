export interface AnswerReplyType {
    id: string;
    userId: string;
    iconURL: string;
    userName: string;
    content: string;
    postingTime: string;
    isLiked: boolean;
    likeCount: number;
    replies: AnswerReplyType[];
};

export interface AnswerType {
    id: string;
    userId: string;
    iconURL: string;
    userName: string;
    content: string;
    postingTime: string;
    likeCount: number;
    isLiked: boolean;
    isBestAnswer: boolean;
    replies: AnswerReplyType[];
};

export interface postAnswerType {
    questionId: string,
    content: string,
    parentAnswerId?: string
}
