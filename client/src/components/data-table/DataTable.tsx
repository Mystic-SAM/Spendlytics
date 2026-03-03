import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Loader, PlusCircleIcon, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import TableSkeleton from "./TableSkeleton";
import { DataTablePagination } from "./DataTablePagination";
import { EmptyState } from "../EmptyState";
import { useState } from "react";

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: FilterOption[];
  className?: string;
  onSearch?: (term: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  selection?: boolean;
  isLoading?: boolean;
  isBulkDeleting?: boolean;
  isShowPagination?: boolean;
  pagination?: {
    totalItems?: number;
    totalPages?: number;
    pageNumber?: number;
    pageSize?: number;
  };
  onPageChange?: (pageNumber: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    searchPlaceholder = "Search...",
    showSearch = true,
    filters = [],
    className,
    onSearch,
    onFilterChange,
    onBulkDelete,
    selection = true,
    isLoading = false,
    isBulkDeleting = false,
    isShowPagination = true,
    pagination,
    onPageChange,
    onPageSizeChange,
  } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<
    Record<string, string>
  >({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: selection ? rowSelection : {},
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: selection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelections = selectedRows.length > 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filterValues, [key]: value };
    setFilterValues(updated);
    onFilterChange?.(updated);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilterValues({});
    onSearch?.("");
    onFilterChange?.({});
    setRowSelection({});
  };

  const handleDelete = () => {
    const selectedIds = selectedRows.map((row: any) => (row.original as any).id);
    onBulkDelete?.(selectedIds);
    setRowSelection({});
  };

  return (
    <div className="w-full">
      {/* Top Bar: Search & Filters */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              disabled={isLoading}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          )}
          {filters.map(({ key, label, options }) => (
            <Select
              key={key}
              value={filterValues[key] ?? ""}
              disabled={isLoading}
              onValueChange={(value) => handleFilterChange(key, value)}
            >
              <SelectTrigger className="min-w-[160px]">
                <div className="flex items-center gap-2">
                  <PlusCircleIcon className="h-4 w-4 opacity-50" />
                  <SelectValue placeholder={label} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {(searchTerm ||
            Object.keys(rowSelection).length > 0 ||
            Object.keys(filterValues).length > 0) && (
              <Button
                variant="ghost"
                disabled={isLoading || isBulkDeleting}
                onClick={handleClear}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
        </div>

        {(selection && hasSelections) || isBulkDeleting ? (
          <Button
            disabled={isLoading || isBulkDeleting}
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete ({selectedRows.length})
            {isBulkDeleting && <Loader className="ml-1 h-4 w-4 animate-spin" />}
          </Button>
        ) : null}
      </div>

      {/* Table */}
      <div className={cn("rounded-md border overflow-x-auto", className)}>
        {isLoading ? (
          <TableSkeleton columns={6} rows={20} />
        ) : (
          <Table
            className={cn(
              table.getRowModel().rows.length === 0 ? "h-[200px]" : ""
            )}
          >
            <TableHeader className="sticky top-0 bg-muted z-10 ">
              {table.getHeaderGroups().map((group: any) => (
                <TableRow key={group.id}>
                  {group.headers.map((header: any) => (
                    <TableHead
                      key={header.id}
                      className="font-medium text-[14px]"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id} className="text-[14px] max-w-[200px]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    <EmptyState title="No records found" description="" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {isShowPagination && (
        <div className="mt-4">
          <DataTablePagination
            pageNumber={pagination?.pageNumber || 1}
            pageSize={pagination?.pageSize || 10}
            totalCount={pagination?.totalItems || 0}
            totalPages={pagination?.totalPages || 0}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}