import { AlertTriangle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/features/admin/adminTypes";

interface DeleteDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  isDeleting: boolean;
}

const DeleteUserDialog = ({
  user,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && isDeleting) return;
    if (!open) onClose();
  }

  return (
    <Dialog open={!!user} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete User Account</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You are about to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {user?.name}
                </span>{" "}
                ({user?.email}).
              </p>
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                <p className="font-medium text-destructive">
                  This will permanently delete:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>All their transactions</li>
                  <li>All their reports & report settings</li>
                  <li>Their account</li>
                </ul>
              </div>
              <p className="text-xs font-medium">
                This action is <span className="text-destructive">irreversible</span>.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => user && onConfirm(user._id)}
            disabled={isDeleting}
            id="confirm-delete-user-btn"
          >
            {isDeleting ?
              <><Loader className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default DeleteUserDialog;
