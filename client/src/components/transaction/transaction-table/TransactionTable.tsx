import { DataTable } from "@/components/data-table/DataTable";
import { TRANSACTION_CATEGORY, type RecurringStatusType, type TransactionCategoryType } from "@/constants/constants";
import { useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import useDebouncedSearch from "@/hooks/useDebounceSearch";
import { useState } from "react";
import { transactionColumns } from "./transactionColumns";
import { DateRangeEnum, DateRangeSelect, type DateRangeType } from "@/components/DateRangeSelect";
import { format } from "date-fns";

type FilterType = {
  type?: TransactionCategoryType | undefined;
  recurringStatus?: RecurringStatusType | undefined;
  pageNumber?: number;
  pageSize?: number;
};

const TransactionTable = (props: {
  pageSize?: number;
  isShowPagination?: boolean;
  isShowDateFilter?: boolean;
}) => {
  const { pageSize, isShowPagination, isShowDateFilter } = props;
  const [filter, setFilter] = useState<FilterType>({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize: pageSize || 10,
  });

  const [dateRange, setDateRange] = useState<DateRangeType>(
    isShowDateFilter
      ? {
        from: null,
        to: null,
        value: DateRangeEnum.ALL_TIME,
        label: "across All Time",
      }
      : null
  );

  const { debouncedTerm, setSearchTerm } = useDebouncedSearch("", {
    delay: 500,
  });

  // Build date range query params
  const dateRangeParams = (() => {
    if (!isShowDateFilter || !dateRange) return {};

    if (dateRange.value === DateRangeEnum.ALL_TIME) return {};

    if (dateRange.value === DateRangeEnum.CUSTOM && dateRange.from && dateRange.to) {
      return {
        dateRangePreset: DateRangeEnum.CUSTOM,
        customFrom: format(dateRange.from, "yyyy-MM-dd"),
        customTo: format(dateRange.to, "yyyy-MM-dd"),
      };
    }

    if (dateRange.value && dateRange.value !== DateRangeEnum.CUSTOM) {
      return {
        dateRangePreset: dateRange.value,
      };
    }

    return {};
  })();

  const { data, isFetching } = useGetAllTransactionsQuery({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
    ...dateRangeParams,
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
    handlePageChange(1);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    const { type, frequency } = filters;
    setFilter((prev) => ({
      ...prev,
      pageNumber: 1,
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

  return (
    <DataTable
      data={transactions}
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
      defaultSort={[{ id: "date", desc: true }]}
      isShowPagination={isShowPagination}
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
          label: "All Frequencies",
          options: [
            { value: "RECURRING", label: "Recurring" },
            { value: "NON_RECURRING", label: "Non-Recurring" },
          ],
        },
      ]}
      filterExtra={
        isShowDateFilter ? (
          <DateRangeSelect
            dateRange={dateRange}
            setDateRange={setDateRange}
            defaultRange={DateRangeEnum.ALL_TIME}
            showCustom
          />
        ) : null
      }
      onSearch={handleSearch}
      onPageChange={(pageNumber) => handlePageChange(pageNumber)}
      onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
      onFilterChange={(filters) => handleFilterChange(filters)}
    />
  );
};
export default TransactionTable;
