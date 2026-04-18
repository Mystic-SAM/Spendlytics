import { Trash2, Crown, CalendarDays, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type AdminUser } from "@/features/admin/adminTypes";
import { cn, formatDateToShort, getInitials } from "@/lib/utils";

interface UserRowProps {
  user: AdminUser;
  currentUserId: string;
  onDelete: (user: AdminUser) => void;
}

const UserRow = ({ user, currentUserId, onDelete }: UserRowProps) => {
  const isSelf = user._id === currentUserId;
  const canDelete = !user.isSuperAdmin && !isSelf;

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors group">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border/30">
        <AvatarImage src={user.profilePicture ?? undefined} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      {/* Name + email */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-foreground truncate">
            {user.name}
          </span>
          {user.isSuperAdmin && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                "border-amber-400/50 text-amber-500 bg-amber-400/10 shrink-0"
              )}
            >
              <Crown className="h-2.5 w-2.5" />
              Super Admin
            </span>
          )}
          {isSelf && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                "border-blue-400/50 text-blue-500 bg-blue-400/10 shrink-0"
              )}
            >
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        </div>
      </div>

      {/* Joined date */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{formatDateToShort(user.createdAt)}</span>
      </div>

      {/* Delete button */}
      {canDelete ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive/80 bg-destructive/10 transition-all"
          onClick={() => onDelete(user)}
          title={`Delete ${user.name}`}
          id={`delete-user-${user._id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <div className="h-8 w-8 shrink-0"></div>
      )}
    </div>
  );
};

export default UserRow;
