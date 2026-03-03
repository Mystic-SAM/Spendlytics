import { DataTable } from "@/components/data-table/DataTable";
import { TRANSACTION_CATEGORY, type RecurringStatusType, type TransactionCategoryType } from "@/constants/constants";
import { useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import useDebouncedSearch from "@/hooks/useDebounceSearch";
import { useState } from "react";
import { transactionColumns } from "./Column";

type FilterType = {
  type?: TransactionCategoryType | undefined;
  recurringStatus?: "RECURRING" | "NON_RECURRING" | undefined;
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
    console.log(debouncedTerm);
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
  };

  return (
    <DataTable
      data={transactions}
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
      isBulkDeleting={false}
      isShowPagination={props.isShowPagination}
      pagination={pagination}
      filters={[
        {
          key: "type",
          label: "All Types",
          options: [
            { value: TRANSACTION_CATEGORY.INCOME, label: "Income" },
            { value: TRANSACTION_CATEGORY.EXPENSE, label: "Expense" },
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