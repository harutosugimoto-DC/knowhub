export type AdminUser = {
  id: string;
  nickname: string | null;
  iconUrl: string;
  isAdmin: boolean;
  createdAt: string;
  questionCount: number;
  answerCount: number;
};

export type AdminUserDetail = AdminUser & {
  bestAnswerCount: number;
};

export type AdminQuestion = {
  id: string;
  title: string;
  userName: string;
  iconUrl: string;
  statusId: string;
  tagNames: string[];
  postingTime: string;
};

export type AdminTag = {
  id: string;
  name: string;
  questionCount: number;
};

export type AdminStats = {
  userCount: number;
  questionCount: number;
  tagCount: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};
