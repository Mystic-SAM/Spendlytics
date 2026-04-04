import type {
  PAYMENT_METHODS_ENUM,
  TRANSACTION_FREQUENCY,
  TransactionCategoryType,
} from "@/constants/constants";

type RecurringIntervalType =
  (typeof TRANSACTION_FREQUENCY)[keyof typeof TRANSACTION_FREQUENCY];

type PaymentMethodType =
  (typeof PAYMENT_METHODS_ENUM)[keyof typeof PAYMENT_METHODS_ENUM];

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
  dateRangePreset?: string;
  customFrom?: string;
  customTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export interface GetSingleTransactionResponse {
  message: string;
  transaction: TransactionType;
}

export interface UpdateTransactionPayload {
  id: string;
  transaction: CreateTransactionBody;
}

export interface BulkTransactionType {
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: PaymentMethodType;
  isRecurring: boolean;
}

export interface BulkImportTransactionPayload {
  transactions: BulkTransactionType[];
}