import {
  ArrowUpDown,
  CircleDot,
  Copy,
  Loader,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/formatCurrency";
import { PAYMENT_METHODS, TRANSACTION_CATEGORY, TRANSACTION_FREQUENCY } from "@/constants/constants";
import type { TransactionType } from "@/features/transaction/transactionTypes";
import { cn } from "@/lib/utils";

type FrequencyInfo = {
  label: string;
  icon: LucideIcon;
};
type FrequencyMapType = {
  [key: string]: FrequencyInfo;
  DEFAULT: FrequencyInfo;
};

export const transactionColumns: ColumnDef<TransactionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.getValue("createdAt"), "MMM dd, yyyy"),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="!pl-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="capitalize">
          {category}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type: string = row.getValue("type");
      return <div className="capitalize">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs",
            {
              "bg-green-100 text-green-800":
                type === TRANSACTION_CATEGORY.INCOME,
              "bg-red-100 text-red-800":
                type === TRANSACTION_CATEGORY.EXPENSE,
              "bg-blue-100 text-blue-800":
                type === TRANSACTION_CATEGORY.INVESTMENT,
            }
          )}
        >
          {type}
        </span>
      </div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.getValue("type");

      return (
        <div
          className={cn("text-right font-medium", {
            "text-green-600": type === TRANSACTION_CATEGORY.INCOME,
            "text-destructive": type === TRANSACTION_CATEGORY.EXPENSE,
            "text-blue-800": type === TRANSACTION_CATEGORY.INVESTMENT,
          })}
        >
          {type === TRANSACTION_CATEGORY.INCOME ? "+" : "-"}
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transaction Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(row.original.date, "MMM dd, yyyy"),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod;
      if (!paymentMethod) return "N/A";
      const paymentMethodLabel = PAYMENT_METHODS.find(method => method.value === paymentMethod)?.label ?? "N/A";
      return (
        <div>{paymentMethodLabel}</div>
      );
    },
  },
  {
    accessorKey: "recurringInterval",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Frequency
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const frequency = row.getValue("recurringInterval");
      const nextDate = row.original?.nextRecurringDate;
      const isRecurring = row.original?.isRecurring;

      const frequencyMap: FrequencyMapType = isRecurring
        ? {
          [TRANSACTION_FREQUENCY.DAILY]: { label: "Daily", icon: RefreshCw },
          [TRANSACTION_FREQUENCY.WEEKLY]: { label: "Weekly", icon: RefreshCw },
          [TRANSACTION_FREQUENCY.MONTHLY]: { label: "Monthly", icon: RefreshCw },
          [TRANSACTION_FREQUENCY.YEARLY]: { label: "Yearly", icon: RefreshCw },
          DEFAULT: { label: "One-time", icon: CircleDot } // Fallback
        }
        : { DEFAULT: { label: "One-time", icon: CircleDot } };

      const frequencyKey = isRecurring ? (frequency as string) : "DEFAULT";
      const frequencyInfo = frequencyMap?.[frequencyKey] || frequencyMap.DEFAULT;
      const { label, icon: Icon } = frequencyInfo;

      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{label}</span>
            {nextDate && isRecurring && (
              <span className="text-xs text-muted-foreground">
                Next: {format(nextDate, "MMM dd yyyy")}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

const ActionsCell = ({ row }: { row: any }) => {

  const isDeleting = true
  const isDuplicating = false

  const handleDuplicate = (e: Event) => {
    e.preventDefault();
    if (isDuplicating) return;

  }

  const handleDelete = (e: Event) => {
    e.preventDefault();
    if (isDeleting) return;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="end"
        onCloseAutoFocus={(e) => {
          if (isDeleting || isDuplicating) {
            e.preventDefault();
          }
        }}
      >
        <DropdownMenuItem onClick={() => console.log("Drawer Open")}>
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="relative"
          disabled={isDuplicating}
          onSelect={handleDuplicate}
        >
          <Copy className="mr-1 h-4 w-4" />
          Duplicate
          {isDuplicating && <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="relative !text-destructive"
          disabled={isDeleting}
          onSelect={handleDelete}
        >
          <Trash2 className="mr-1 h-4 w-4 !text-destructive" />
          Delete
          {isDeleting && <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
