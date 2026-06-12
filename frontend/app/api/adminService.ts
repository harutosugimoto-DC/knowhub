import axiosClient from './axiosClient';
import type { AdminStats, AdminUser, AdminUserDetail, AdminQuestion, AdminTag, PaginatedResponse } from '@/types/admin';

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await axiosClient.get<AdminStats>('admin/stats');
  return res.data;
};

export const getAdminUsers = async (page = 1, search?: string): Promise<PaginatedResponse<AdminUser>> => {
  const res = await axiosClient.get<PaginatedResponse<AdminUser>>('admin/users', {
    params: { page, search },
  });
  return res.data;
};

export const getAdminUserDetail = async (userId: string): Promise<AdminUserDetail> => {
  const res = await axiosClient.get<AdminUserDetail>(`admin/users/${userId}`);
  return res.data;
};

export const deleteAdminUser = async (userId: string): Promise<void> => {
  await axiosClient.delete(`admin/users/${userId}`);
};

export const toggleAdminRole = async (userId: string, isAdmin: boolean): Promise<void> => {
  await axiosClient.patch(`admin/users/${userId}/admin`, { isAdmin });
};

export const getAdminQuestions = async (page = 1, keyword?: string): Promise<PaginatedResponse<AdminQuestion>> => {
  const res = await axiosClient.get<PaginatedResponse<AdminQuestion>>('admin/questions', {
    params: { page, keyword },
  });
  return res.data;
};

export const deleteAdminQuestion = async (questionId: string): Promise<void> => {
  await axiosClient.delete(`admin/questions/${questionId}`);
};

export const getAdminTags = async (): Promise<AdminTag[]> => {
  const res = await axiosClient.get<AdminTag[]>('admin/tags');
  return res.data;
};

export const createAdminTag = async (name: string): Promise<void> => {
  await axiosClient.post('admin/tags', { name });
};

export const deleteAdminTag = async (tagId: string): Promise<void> => {
  await axiosClient.delete(`admin/tags/${tagId}`);
};
