import axiosClient from './axiosClient'; // パスは環境に合わせて調整してください

// タグデータの型定義
export interface TagType {
    id: string;
    name: string;
}


export const getTags = async (): Promise<TagType[]> => {
    const response = await axiosClient.get<TagType[]>('/tags');
    return response.data;
};