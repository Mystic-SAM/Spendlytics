import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { logout, updateCredentials } from "@/features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const auth = (getState() as RootState).auth;
    if (auth?.accessToken) {
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
    }
    return headers;
  },
});

/**
 * Mutex to prevent multiple concurrent refresh attempts.
 * If several requests fail with 401 at the same time, only
 * the first one triggers a refresh — the rest wait for it.
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Prevent multiple parallel refresh calls
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh-token", method: "POST" },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const { accessToken, expiresAt } = refreshResult.data as {
            accessToken: string;
            expiresAt: number;
          };
          api.dispatch(updateCredentials({ accessToken, expiresAt }));
          return true;
        }

        api.dispatch(logout());
        return false;
      })().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    // Wait for the in-flight refresh to complete
    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiClient = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  tagTypes: ["transactions", "analytics"],
  endpoints: () => ({}),
});
