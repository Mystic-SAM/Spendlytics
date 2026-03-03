import { DataTable } from "@/components/data-table/DataTable";
import { TRANSACTION_CATEGORY, type RecurringStatusType, type TransactionCategoryType } from "@/constants/constants";
import { useBulkDeleteTransactionMutation, useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import useDebouncedSearch from "@/hooks/useDebounceSearch";
import { useState } from "react";
import { transactionColumns } from "./Column";
import { toast } from "sonner";

type FilterType = {
  type?: TransactionCategoryType | undefined;
  recurringStatus?: RecurringStatusType | undefined;
  pageNumber?: number;
  pageSize?: number;
};

const TransactionTable = (props: {
  pageSize?: number;
  isShowPagination?: boolean;
}) => {
  const [filter, setFilter] = useState<FilterType>({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize: props.pageSize || 10,
  });

  const { debouncedTerm, setSearchTerm } = useDebouncedSearch("", {
    delay: 500,
  });

  const [bulkDeleteTransaction, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionMutation();

  const { data, isFetching } = useGetAllTransactionsQuery({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  });

  const transactions = data?.transactions || [];

  const pagination = {
    totalItems: data?.pagination?.totalCount || 0,
    totalPages: data?.pagination?.totalPages || 0,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  };


  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    const { type, frequency } = filters;
    setFilter((prev) => ({
      ...prev,
      type: type as TransactionCategoryType,
      recurringStatus: frequency as RecurringStatusType,
    }));
  };


  const handlePageChange = (pageNumber: number) => {
    setFilter((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize }));
  };

  const handleBulkDelete = (transactionIds: string[]) => {
    console.log(transactionIds);

    bulkDeleteTransaction(transactionIds)
      .unwrap()
      .then(() => {
        toast.success("Transactions deleted successfully");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to delete transactions");
      });
  };

  return (
    <DataTable
      data={transactions}
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
      isBulkDeleting={isBulkDeleting}
      isShowPagination={props.isShowPagination}
      pagination={pagination}
      filters={[
        {
          key: "type",
          label: "All Types",
          options: [
            { value: TRANSACTION_CATEGORY.INCOME, label: "Income" },
            { value: TRANSACTION_CATEGORY.EXPENSE, label: "Expense" },
            { value: TRANSACTION_CATEGORY.INVESTMENT, label: "Investment" },
          ],
        },
        {
          key: "frequency",
          label: "Frequency",
          options: [
            { value: "RECURRING", label: "Recurring" },
            { value: "NON_RECURRING", label: "Non-Recurring" },
          ],
        },
      ]}
      onSearch={handleSearch}
      onPageChange={(pageNumber) => handlePageChange(pageNumber)}
      onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
      onFilterChange={(filters) => handleFilterChange(filters)}
      onBulkDelete={handleBulkDelete}
    />
  );
};
export default TransactionTable;