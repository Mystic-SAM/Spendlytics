import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader } from "lucide-react";
import type { GetAllTransactionParams } from "@/features/transaction/transactionTypes";
import { downloadTransactionsAsExcel } from "@/features/transaction/transactionDownloadApi";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { MAX_TRANSACTIONS_EXPORT_LIMIT } from "@/constants/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface DownloadTransactionButtonProps {
  filters: GetAllTransactionParams;
  disabled?: boolean;
}

export default function DownloadTransactionButton({
  filters,
  disabled = false,
}: DownloadTransactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const token = useSelector((state: RootState) => state.auth?.accessToken || '');

  const handleDownloadClick = () => {
    if (!token) {
      toast.error("Error", {
        description: "You are not authenticated. Please log in.",
        duration: Infinity,
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmDownload = async () => {
    setIsLoading(true);
    try {
      await downloadTransactionsAsExcel(filters, token);

      toast.success("Success", {
        description: `Transactions downloaded successfully!`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download transactions. Please try again.";
      toast.error("Error", {
        description: errorMessage,
        duration: Infinity,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="!shadow-none !cursor-pointer !border-gray-500 !text-white !bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDownloadClick}
        disabled={disabled || isLoading || !token}
        title={`Download filtered transactions as Excel file (max ${MAX_TRANSACTIONS_EXPORT_LIMIT} rows)`}
      >
        <DownloadIcon className="!w-5 !h-5" />
        {isLoading ? "Downloading..." : "Download"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Download Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to download the filtered transactions?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 text-sm">
              <strong>Notice:</strong> Only the first <strong>{MAX_TRANSACTIONS_EXPORT_LIMIT}</strong> transactions will be exported.
              Please apply more filters to narrow down your results if necessary.
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="text-white"
              onClick={handleConfirmDownload}
              disabled={isLoading}
            >
              {
                isLoading ?
                  <><Loader className="mr-2 h-4 w-4 animate-spin" /> Downloading...</> : "Confirm Download"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
