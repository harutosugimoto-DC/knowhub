import axiosClient from './axiosClient';

export interface TagType {
    id: string;
    name: string;
}


export const getTags = async (): Promise<TagType[]> => {
    const response = await axiosClient.get<TagType[]>('/tags');
    return response.data;
};