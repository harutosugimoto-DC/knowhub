import type { myData } from "@/types/user";
import axiosClient from "./axiosClient";
import type { QuestionType } from "@/types/question";

export interface ProfileIconResponse {
    profile_icon_url: string;
}

/**
 * 自分のプロフィールデータ取得
 * @returns 
 */
export const getMyData = async (): Promise<myData> => {
    const response = await axiosClient.get<myData>("users/me")
    return response.data
}
/**
 * 自分が最近解決した質問取得
 * @returns 
 */
export const getRecentlySolved = async (): Promise<QuestionType[]> => {
    const response = await axiosClient.get<QuestionType[]>("users/me/recently-solved")
    return response.data
}

/**
 * プロフィールアイコンを更新する（画像アップロード）
 * @param file アップロードする画像ファイル（Fileオブジェクト）
 */
export const updateProfileIcon = async (file: File): Promise<ProfileIconResponse> => {
    // 画像ファイルを送るために FormData を作成
    const formData = new FormData();
    formData.append('icon', file);

    const response = await axiosClient.patch<ProfileIconResponse>(`/users/me/icon`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * ユーザーのよく回答しているタグ一覧取得
 * @returns 
 */
export const getTopTags = async (): Promise<({ name: string, count: number })[]> => {
    const response = await axiosClient.get<({ name: string, count: number })[]>(`users/me/top-tags`)
    return response.data
}

/**
 * ユーザーの活動推移（月ごとの回答件数）を取得
 * @param from 開始月 (フォーマット: "YYYY-MM")
 * @param to 終了月 (フォーマット: "YYYY-MM")
 * @returns 月ごとの件数配列
 */
export const getActivity = async (
    from?: string,
    to?: string
): Promise<{ month: string; count: number }[]> => {

    const response = await axiosClient.get<{ month: string; count: number }[]>(
        `users/me/activity`,
        { params: { from, to } }
    );

    return response.data;
};