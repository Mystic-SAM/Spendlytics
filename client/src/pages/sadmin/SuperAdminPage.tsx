import { useState, useCallback } from "react";
import { useTypedSelector } from "@/app/hook";
import { useGetUsersQuery, useDeleteUserMutation } from "@/features/admin/adminAPI";
import useDebouncedSearch from "@/hooks/useDebounceSearch";
import { toast } from "sonner";
import {
  Users,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteUserDialog from "./components/DeleteUserDialog";
import UserRow from "./components/UserRow";
import UserRowSkeleton from "./components/UserRowSkeleton";
import type { AdminUser } from "@/features/admin/adminTypes";

const LIMIT = 10;

const SuperAdminPage = () => {
  const currentUser = useTypedSelector((state) => state.auth.user);

  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const { searchTerm: search, debouncedTerm: debouncedSearch, setSearchTerm } = useDebouncedSearch("", { delay: 400 });

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    search: debouncedSearch || undefined,
    page,
    limit: LIMIT,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setPage(1);
    },
    [setSearchTerm],
  );

  const handleDeleteConfirm = async (userId: string) => {
    try {
      const res = await deleteUser(userId).unwrap();
      toast.success(res.message);
      setPendingDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? "Failed to delete user. Please try again.",
      );
    }
  };

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Super Admin Console
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage all registered users and their data
              </p>
            </div>
          </div>

          {/*  Stat Pills  */}
          {data && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs bg-card border border-border/50 rounded-full px-3 py-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {pagination?.total ?? 0}
                </span>
                <span>Total Users</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="admin-user-search"
            className="pl-9 bg-card/60 border-border/50"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* User list */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <UserRowSkeleton key={i} />
            ))
          ) : data?.users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <Users className="h-10 w-10 opacity-30" />
              <div>
                <p className="font-medium">No users found</p>
                {search && (
                  <p className="text-sm mt-1">
                    No results for "
                    <span className="text-foreground">{search}</span>"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`space-y-2 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
            >
              {data?.users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  currentUserId={currentUser?.id?.toString() ?? ""}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
              {" · "}
              <span className="font-medium text-foreground">
                {pagination?.total}
              </span>{" "}
              users
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                id="admin-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                id="admin-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/*  Delete User Dialog  */}
      <DeleteUserDialog
        user={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SuperAdminPage;
