import axiosClient from "./axiosClient";

// --- 型定義 ---
interface CommonResponse {
    message: string;
}

// --- API呼び出し関数 ---

/**
 * 回答にいいねを追加する
 * POST /api/v1/answers/:answerId/like
 */
export const addAnswerLike = async (answerId: number | string): Promise<CommonResponse> => {
    // ※axiosClientのbaseURL設定（末尾が/api/v1かどうか）に合わせてパスを調整してください
    const response = await axiosClient.post<CommonResponse>(`/answers/${answerId}/like`);
    return response.data;
};

/**
 * 回答のいいねを解除する
 * DELETE /api/v1/answers/:answerId/like
 */
export const removeAnswerLike = async (answerId: number | string): Promise<CommonResponse> => {
    const response = await axiosClient.delete<CommonResponse>(`/answers/${answerId}/like`);
    return response.data;
};

// オブジェクトにまとめてエクスポート
const answerService = {
    addAnswerLike,
    removeAnswerLike,
};

export default answerService;