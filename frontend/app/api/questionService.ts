import type { QuestionType } from "@/types/question";
import axiosClient from "./axiosClient";

export interface GetQuestionsParams {
    page?: number;
    order?: 'new' | 'likes';
    keyword?: string;
    tagId?: string;
}


export interface GetQuestionsResponse {
    page: number;
    order: string;
    keyword: string | null;
    tagId: string | null;
    data: QuestionType[];
}

export interface QuestionDetail extends QuestionType {
    content: string;
}

interface CommonResponse {
    message: string;
}

// --- API呼び出し関数群 ---

// 1. 質問一覧取得
export const getQuestions = async (params?: GetQuestionsParams): Promise<GetQuestionsResponse> => {
    const response = await axiosClient.get<GetQuestionsResponse>('/questions', { params });
    return response.data;
};

// 2. 質問詳細取得
export const getQuestionById = async (questionId: number | string): Promise<QuestionDetail> => {
    const response = await axiosClient.get<QuestionDetail>(`/questions/${questionId}`);
    return response.data;
};

// 3. ブックマーク追加
export const addBookmark = async (questionId: number | string): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/questions/${questionId}/bookmark`);
    return response.data;
};

// 4. ブックマーク解除
export const removeBookmark = async (questionId: number | string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/questions/${questionId}/bookmark`);
    return response.data;
};

// 5. いいね追加
export const addLike = async (questionId: number | string): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/questions/${questionId}/like`);
    return response.data;
};

// 6. いいね解除
export const removeLike = async (questionId: number | string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/questions/${questionId}/like`);
    return response.data;
};

// まとめてデフォルトエクスポート
const questionService = {
    getQuestions,
    getQuestionById,
    addBookmark,
    removeBookmark,
    addLike,
    removeLike,
};

export default questionService;