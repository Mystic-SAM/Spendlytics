import { apiClient } from "@/app/apiClient";
import type { UpdateUserPayload, UpdateUserResponse } from "./userTypes";


export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({

    updateUser: builder.mutation<UpdateUserResponse, UpdateUserPayload>({
      query: (payload) => ({
        url: "/user/update",
        method: "PUT",
        body: payload,
      }),
    }),
  })
})

export const { useUpdateUserMutation } = userApi;