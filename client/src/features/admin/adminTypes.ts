export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  message: string;
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeleteUserResponse {
  message: string;
  deletedUserId: string;
}