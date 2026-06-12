import axiosClient from './axiosClient';

export interface UserProfileResponse {
    id: string;
    nickname: string | null;
    profile_icon_url: string;
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