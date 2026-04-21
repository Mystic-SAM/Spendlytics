import { Skeleton } from "@/components/ui/skeleton";

const UserRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/50 bg-card/50">
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-3 w-24 hidden sm:block" />
    <Skeleton className="h-8 w-8 rounded-md shrink-0" />
  </div>
);

export default UserRowSkeleton;
