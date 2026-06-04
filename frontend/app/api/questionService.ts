import type { GetQuestionsParams, GetQuestionsResponse, QuestionDetail, QuestionType } from "@/types/question";
import axiosClient from "./axiosClient";
import type { AnswerType, postAnswerType } from "@/types/answer";

interface CommonResponse {
    message: string;
}

/**
 * 質問一覧取得
 * @param params
 * @returns
 */
export const getQuestions = async (params?: GetQuestionsParams): Promise<GetQuestionsResponse> => {
    const response = await axiosClient.get<GetQuestionsResponse>('/questions', { params });
    return response.data;
};

/**
 * 質問詳細取得
 * @param questionId
 * @returns
 */
export const getQuestionById = async (questionId: string): Promise<QuestionDetail> => {
    const response = await axiosClient.get<QuestionDetail>(`/questions/${questionId}`);
    return response.data;
};

/**
 * その質問の回答一覧取得
 * @param questionId
 * @returns
 */
export const getQuestionAnswers = async (questionId: string): Promise<AnswerType[]> => {
    const response = await axiosClient.get<AnswerType[]>(`/questions/${questionId}/answers`);
    return response.data;
};

export const postAnswer = async (params: postAnswerType): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/questions/${params.questionId}/answers`, {
        content: params.content,
        parentAnswerId: params.parentAnswerId,
    }, { skipSuccessToast: true });
    return response.data;
};

/**
 * 質問のブックマーク追加
 * @param questionId
 * @returns
 */
export const addBookmark = async (questionId: string): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/questions/${questionId}/bookmark`);
    return response.data;
};

/**
 * 質問のブックマーク解除
 * @param questionId
 * @returns
 */
export const removeBookmark = async (questionId: string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/questions/${questionId}/bookmark`);
    return response.data;
};

/**
 * 質問のいいね追加
 * @param questionId
 * @returns
 */
export const addLike = async (questionId: string): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/questions/${questionId}/like`);
    return response.data;
};

/**
 * 質問のいいね解除
 * @param questionId
 * @returns
 */
export const removeLike = async (questionId: string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/questions/${questionId}/like`);
    return response.data;
};

/**
 * 質問削除
 * @param questionId
 */
export const deleteQuestion = async (questionId: string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/questions/${questionId}`);
    return response.data;
};

const questionService = {
    getQuestions,
    getQuestionById,
    addBookmark,
    removeBookmark,
    addLike,
    removeLike,
};

export default questionService;
