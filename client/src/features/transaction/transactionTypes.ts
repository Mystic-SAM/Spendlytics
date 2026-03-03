import type {
  TRANSACTION_FREQUENCY,
  TransactionCategoryType,
} from "@/constants/constants";

type RecurringIntervalType =
  (typeof TRANSACTION_FREQUENCY)[keyof typeof TRANSACTION_FREQUENCY];

export interface CreateTransactionBody {
  title: string;
  type: TransactionCategoryType;
  amount: number;
  description: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: RecurringIntervalType | null;
  paymentMethod: string;
}

export interface GetAllTransactionParams {
  keyword?: string;
  type?: TransactionCategoryType;
  recurringStatus?: "RECURRING" | "NON_RECURRING";
  pageNumber?: number;
  pageSize?: number;
}

export interface TransactionType {
  _id: string;
  userId: string;
  title: string;
  type: TransactionCategoryType;
  amount: number;
  description: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringInterval: RecurringIntervalType | null;
  nextRecurringDate: string | null;
  lastProcessed: string | null;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface GetAllTransactionResponse {
  message: string;
  transactions: TransactionType[];
  pagination: {
    pageSize: number;
    pageNumber: number;
    totalCount: number;
    totalPages: number;
    skip: number;
  };
}