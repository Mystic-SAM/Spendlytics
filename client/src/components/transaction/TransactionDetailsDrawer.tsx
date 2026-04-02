import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  PAYMENT_METHODS,
  TRANSACTION_CATEGORY,
  TRANSACTION_FREQUENCY_OPTIONS,
} from "@/constants/constants";
import type { TransactionType } from "@/features/transaction/transactionTypes";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CircleDot,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionType | null;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex items-start gap-3 py-3">
    <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-muted-foreground font-medium uppercase">
        {label}
      </span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  </div>
);

const TransactionDetailsDrawer = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsDrawerProps) => {
  if (!transaction) return null;

  const { paymentMethod, recurringInterval, isRecurring, type, category, date, createdAt, updatedAt, description, nextRecurringDate, lastProcessed, status, amount, title } = transaction;

  const paymentMethodLabel =
    PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ??
    paymentMethod ??
    "N/A";

  const recurringLabel = isRecurring && recurringInterval
    ? (TRANSACTION_FREQUENCY_OPTIONS.find((o) => o.value === recurringInterval)?.label ?? recurringInterval)
    : null;

  const typeConfig = {
    [TRANSACTION_CATEGORY.INCOME]: {
      badgeClass: "bg-green-100 text-green-800 border-green-200",
      amountClass: "text-green-600",
      prefix: "+",
      Icon: TrendingUp,
    },
    [TRANSACTION_CATEGORY.EXPENSE]: {
      badgeClass: "bg-red-100 text-red-800 border-red-200",
      amountClass: "text-destructive",
      prefix: "-",
      Icon: TrendingDown,
    },
    [TRANSACTION_CATEGORY.INVESTMENT]: {
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      amountClass: "text-blue-700",
      prefix: "-",
      Icon: Wallet,
    },
  };

  const config =
    typeConfig[type as keyof typeof typeConfig] ??
    typeConfig[TRANSACTION_CATEGORY.EXPENSE];

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="max-w-md overflow-hidden overflow-y-auto">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl font-semibold">
            Transaction Details
          </DrawerTitle>
          <DrawerDescription>
            Full details of the selected transaction
          </DrawerDescription>
        </DrawerHeader>

        {/* Amount Hero Section */}
        <div className="px-4 pb-4">
          <div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "capitalize text-xs font-semibold border rounded-full px-2 py-0.5",
                  config.badgeClass
                )}
              >
                {type.toLowerCase()}
              </span>
              {status && (
                <span className="text-xs capitalize border rounded-full px-2 py-0.5 text-muted-foreground">
                  {status.toLowerCase()}
                </span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <span
                className={cn("text-3xl font-bold tracking-tight", config.amountClass)}
              >
                {config.prefix}
                {formatCurrency(amount)}
              </span>
            </div>
            <p className="text-base font-medium text-foreground">
              {title}
            </p>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="px-4 divide-y">
          <DetailRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Transaction Date"
            value={format(date, "MMMM dd, yyyy")}
          />

          <DetailRow
            icon={<Tag className="h-4 w-4" />}
            label="Category"
            value={
              <span className="capitalize">
                {category || "N/A"}
              </span>
            }
          />

          <DetailRow
            icon={<CreditCard className="h-4 w-4" />}
            label="Payment Method"
            value={paymentMethodLabel}
          />

          <DetailRow
            icon={
              isRecurring ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <CircleDot className="h-4 w-4" />
              )
            }
            label="Frequency"
            value={
              isRecurring ? (
                <div className="flex flex-col gap-0.5">
                  <span>{recurringLabel ?? "Recurring"}</span>
                  {nextRecurringDate && (
                    <span className="text-xs text-muted-foreground font-normal">
                      Next:{" "}
                      {format(nextRecurringDate, "MMM dd, yyyy")}
                    </span>
                  )}
                  {lastProcessed && (
                    <span className="text-xs text-muted-foreground font-normal">
                      Last processed:{" "}
                      {format(lastProcessed, "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
              ) : (
                "One-time"
              )
            }
          />

          {description && (
            <DetailRow
              icon={<FileText className="h-4 w-4" />}
              label="Description"
              value={description}
            />
          )}

          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Created At"
            value={format(createdAt, "MMM dd, yyyy · hh:mm a")}
          />

          {updatedAt &&
            updatedAt !== createdAt && (
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label="Last Updated"
                value={format(updatedAt, "MMM dd, yyyy · hh:mm a")}
              />
            )}
        </div>

        <div className="h-6" />
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionDetailsDrawer;
