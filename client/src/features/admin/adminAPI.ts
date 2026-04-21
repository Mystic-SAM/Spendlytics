import { apiClient } from "@/app/apiClient";
import type { DeleteUserResponse, GetUsersParams, GetUsersResponse } from "./adminTypes";

export const adminApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: ({ search, page = 1, limit = 20 }) => ({
        url: "/admin/users",
        params: { search: search || undefined, page, limit },
      }),
      providesTags: ["users"],
    }),

    deleteUser: builder.mutation<DeleteUserResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const { useGetUsersQuery, useDeleteUserMutation } = adminApi;
