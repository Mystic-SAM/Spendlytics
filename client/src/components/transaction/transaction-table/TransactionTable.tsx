import { DataTable } from "@/components/data-table/DataTable";
import { TRANSACTION_CATEGORY, type RecurringStatusType, type TransactionCategoryType } from "@/constants/constants";
import { useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import useDebouncedSearch from "@/hooks/useDebounceSearch";
import { useState, useEffect, useMemo } from "react";
import { transactionColumns } from "./transactionColumns";
import { DateRangeEnum, DateRangeSelect, type DateRangeType } from "@/components/DateRangeSelect";
import type { SortingState } from "@tanstack/react-table";
import { formatDateToShort } from "@/lib/utils";
import type { GetAllTransactionParams } from "@/features/transaction/transactionTypes";

type FilterType = {
  type?: TransactionCategoryType | undefined;
  recurringStatus?: RecurringStatusType | undefined;
  pageNumber?: number;
  pageSize?: number;
};

type TransactionTableProps = {
  pageSize?: number;
  isShowPagination?: boolean;
  isShowDateFilter?: boolean;
  onQueryParamsChange?: (params: GetAllTransactionParams) => void;
};

const TransactionTable = (props: TransactionTableProps) => {
  const {
    pageSize,
    isShowPagination,
    isShowDateFilter,
    onQueryParamsChange,
  } = props;

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

  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);

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
        customFrom: formatDateToShort(dateRange.from),
        customTo: formatDateToShort(dateRange.to),
      };
    }

    if (dateRange.value && dateRange.value !== DateRangeEnum.CUSTOM) {
      return {
        dateRangePreset: dateRange.value,
      };
    }

    return {};
  })();

  // Extract sort params from sorting state
  const sortParams = (() => {
    if (!sorting || sorting.length === 0) {
      return { sortBy: "date", sortOrder: "desc" as const };
    }
    const { id, desc } = sorting[0];
    return {
      sortBy: id,
      sortOrder: desc ? ("desc" as const) : ("asc" as const),
    };
  })();

  const queryParams = useMemo<GetAllTransactionParams>(() => ({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
    ...dateRangeParams,
    ...sortParams,
  }), [
    debouncedTerm,
    filter.type,
    filter.recurringStatus,
    filter.pageNumber,
    filter.pageSize,
    dateRangeParams.dateRangePreset,
    dateRangeParams.customFrom,
    dateRangeParams.customTo,
    sortParams.sortBy,
    sortParams.sortOrder,
  ]);

  useEffect(() => {
    if (onQueryParamsChange) {
      onQueryParamsChange(queryParams);
    }
  }, [queryParams, onQueryParamsChange]);

  const { data, isFetching } = useGetAllTransactionsQuery(queryParams);

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

  const handleDateRangeChange = (newDateRange: DateRangeType) => {
    setDateRange(newDateRange);
    handlePageChange(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setFilter((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize }));
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    handlePageChange(1);
  };

  return (
    <DataTable
      data={transactions}
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
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
            setDateRange={handleDateRangeChange}
            defaultRange={DateRangeEnum.ALL_TIME}
            showCustom
          />
        ) : null
      }
      onSearch={handleSearch}
      onPageChange={(pageNumber) => handlePageChange(pageNumber)}
      onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
      onFilterChange={(filters) => handleFilterChange(filters)}
      onSortingChange={handleSortingChange}
      defaultSort={sorting}
    />
  );
};
export default TransactionTable;
