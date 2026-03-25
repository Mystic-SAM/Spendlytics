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
import { PlusCircleIcon, Trash, X } from "lucide-react";
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
import { useState, type ReactNode } from "react";
import DeleteTransactionDialog from "../DeleteTransactionDialog";

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
  filterExtra?: ReactNode;
  tableWrapperClassName?: string;
  cellClassName?: string;
  onSearch?: (term: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  selection?: boolean;
  isLoading?: boolean;
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
    filterExtra,
    tableWrapperClassName,
    cellClassName,
    onSearch,
    onFilterChange,
    selection = true,
    isLoading = false,
    isShowPagination = true,
    pagination,
    onPageChange,
    onPageSizeChange,
  } = props;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row: any) => row.id,
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

  const selectedRowIds = Object.keys(rowSelection);
  const totalSelectedCount = selectedRowIds.length;
  const hasSelections = totalSelectedCount > 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filterValues };
    if (value === "all") {
      delete updated[key];
    } else {
      updated[key] = value;
    }
    setFilterValues(updated);
    onFilterChange?.(updated);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch?.("");
  };

  const handleClearSelection = () => {
    setRowSelection({});
  };

  return (
    <>
      <div className="w-full flex flex-col gap-y-4">
        {/* Top Bar: Search & Filters */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {showSearch && (
              <div className="relative max-w-sm">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  disabled={isLoading}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-8"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear Search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
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
                  <SelectItem value="all">{label}</SelectItem>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {filterExtra}

            {selection && hasSelections && (
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={handleClearSelection}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection ({totalSelectedCount})
              </Button>
            )}
          </div>

          {selection && hasSelections ? (
            <Button
              disabled={isLoading}
              variant="destructive"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete ({totalSelectedCount})
            </Button>
          ) : null}
        </div>

        {/* Table */}
        <div
          className={cn(
            "rounded-md border overflow-x-auto",
            tableWrapperClassName,
          )}
        >
          {isLoading ? (
            <TableSkeleton columns={6} rows={10} />
          ) : (
            <Table
              className={cn(
                table.getRowModel().rows.length === 0 ? "h-[200px]" : "",
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
                          header.getContext(),
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
                        <TableCell
                          key={cell.id}
                          className={cn("text-[14px]", cellClassName)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
          <DataTablePagination
            pageNumber={pagination?.pageNumber || 1}
            pageSize={pagination?.pageSize || 10}
            totalCount={pagination?.totalItems || 0}
            totalPages={pagination?.totalPages || 0}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
      <DeleteTransactionDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        transactionId={selectedRowIds}
        isBulkDelete
        title="Confirm Delete"
        description={`Are you sure you want to delete ${totalSelectedCount} transactions? This action cannot be undone.`}
        onConfirm={handleClearSelection}
      />
    </>
  );
}
