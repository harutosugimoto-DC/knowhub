import axiosClient from './axiosClient';

// ステータスデータの型定義
export interface StatusType {
    id: number;
    name: string;
}

export const getStatuses = async (): Promise<StatusType[]> => {
    const response = await axiosClient.get<StatusType[]>('/statuses');
    return response.data;
}
