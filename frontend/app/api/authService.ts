import axiosClient from './axiosClient';

// APIのレスポンス型定義
export interface UserProfileResponse {
    nickname: string | null;
    id?: string;
    iconURL?: string;
}

export const authService = {
    /**
     * ログインユーザーのプロフィール（ニックネーム等）を取得する
     * GET /api/v1/users
     */
    getUserProfile: async (): Promise<UserProfileResponse> => {
        const response = await axiosClient.get<UserProfileResponse>('/users');
        return response.data;
    },

    /**
     * ニックネームを新規登録・更新する
     * PATCH /api/v1/users/nickname
     */
    updateNickname: async (nickname: string): Promise<void> => {
        await axiosClient.patch('/users/nickname', { nickname });
    }
};