export interface QuestionType {
    id: string,
    title: string;
    iconUrl: string;
    statusId: string;
    isLiked: boolean;
    isBookmarked: boolean;
    userName: string;
    postingTime: string;
    likeCount: number;
    bookmarkCount: number;
    replyCount: number;
    tagNames: string[];
    myActions: ('my_questions' | 'my_answers' | 'my_solved' | 'bookmarked')[];
};

export interface QuestionDetail extends QuestionType {
    userId: string;
    content: string;
}

export interface GetQuestionsParams {
    currentPage: number,
    order: 'likesAsc' | 'likesDesc' | 'newAsc' | 'newDesc',
    keyword?: string,
    tagIds?: string[],
    myActions?: ('my_questions' | 'my_answers' | 'my_solved' | 'bookmarked')[],
    statusIds?: string[],
}

export interface GetQuestionsResponse {
    currentPage: number,
    iconUrl: string,
    totalPages: number,
    order: 'likesAsc' | 'likesDesc' | 'newAsc' | 'newDesc',
    keyword: string | null,
    tagId: string[] | null,
    myActions: ('my_questions' | 'my_answers' | 'my_solved' | 'bookmarked') | null,
    statusId: string[] | null,
    data: QuestionType[]
}