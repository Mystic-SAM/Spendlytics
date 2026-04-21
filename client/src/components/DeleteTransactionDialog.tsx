import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useBulkDeleteTransactionMutation,
  useDeleteTransactionMutation,
} from "@/features/transaction/transactionAPI";
import { toast } from "sonner";

interface BaseProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  title?: string;
  description?: string;
  onConfirm?: () => void;
}

interface BulkDeleteProps extends BaseProps {
  isBulkDelete: true;
  transactionId: string[];
}

interface SingleDeleteProps extends BaseProps {
  isBulkDelete?: false;
  transactionId: string;
}

type ConfirmDeleteDialogProps = BulkDeleteProps | SingleDeleteProps;

const DeleteTransactionDialog = (props: ConfirmDeleteDialogProps) => {
  const {
    isOpen,
    setIsOpen,
    title = "Delete?",
    description = "This action cannot be undone.",
    isBulkDelete,
    transactionId,
    onConfirm,
  } = props;

  const [bulkDeleteTransaction, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionMutation();
  const [deleteTransaction, { isLoading: isSingleDeleting }] =
    useDeleteTransactionMutation();
  const isDeleting = isBulkDeleting || isSingleDeleting;

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      if (isBulkDelete) {
        await bulkDeleteTransaction(transactionId).unwrap();
        toast.success("Selected transactions deleted successfully");
      } else {
        await deleteTransaction(transactionId).unwrap();
        toast.success("Transaction deleted successfully");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        (isBulkDelete
          ? "Failed to delete transactions"
          : "Failed to delete transaction")
      );
    } finally {
      onConfirm?.();
      setIsOpen(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val && isDeleting) return;
    setIsOpen(val);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="!bg-destructive text-destructive-foreground hover:!bg-destructive/90"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
            {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransactionDialog;
