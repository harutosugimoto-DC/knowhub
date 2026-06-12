import axiosClient from "./axiosClient";

interface CommonResponse {
    message: string;
}

/**
 * 回答を削除する
 * @param answerId 
 * @returns 
 */
export const deleteAnswer = async (answerId:string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/answers/${answerId}`);
    return response.data;
};

/**
 * 
 * 回答をベストアンサーに選ぶ
 * @param answerId 
 * @returns 
 */
export const acceptAnswer = async (answerId:string): Promise<CommonResponse> => {
    // フロント側で任意の文言を表示できるように、自動成功トーストを抑止するフラグを渡す
    const response = await axiosClient.patch<CommonResponse>(`/answers/${answerId}/accept`, undefined, { skipSuccessToast: true });
    return response.data;
};

/**
 * 回答にいいねを追加する
 * POST /api/v1/answers/:answerId/like
 */
export const addAnswerLike = async (answerId:string): Promise<CommonResponse> => {
    const response = await axiosClient.post<CommonResponse>(`/answers/${answerId}/like`);
    return response.data;
};

/**
 * 回答のいいねを解除する
 * DELETE /api/v1/answers/:answerId/like
 */
export const removeAnswerLike = async (answerId: string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/answers/${answerId}/like`);
    return response.data;
};