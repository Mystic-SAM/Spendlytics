import { apiClient } from "@/app/apiClient";
import type { CreateTransactionBody, GetAllTransactionParams, GetAllTransactionResponse } from "./transactionTypes";

export const transactionApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<void, CreateTransactionBody>({
      query: (body) => ({
        url: "/transaction/create",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["transactions", "analytics"],
    }),

    getAllTransactions: builder.query<GetAllTransactionResponse, GetAllTransactionParams>({
      query: (params) => {
        const { keyword = undefined, type = undefined, recurringStatus = undefined, pageNumber = 1, pageSize = 10 } = params;

        return ({
          url: "/transaction/all",
          method: "GET",
          params: {
            keyword,
            type,
            recurringStatus,
            pageNumber,
            pageSize,
          },
        })
      },
      providesTags: ["transactions"],
    }),
  }),
});

export const { useCreateTransactionMutation, useGetAllTransactionsQuery } = transactionApi;
