import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/app/hook";
import { logout } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/features/auth/authAPI";
import { AUTH_ROUTES } from "@/routes/common/routePath";

interface LogoutDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const LogoutDialog = ({ isOpen, setIsOpen }: LogoutDialogProps) => {
  const [logoutApi, { isLoading: isPending }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(logout());
      navigate(AUTH_ROUTES.SIGN_IN);
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to log out?</DialogTitle>
          <DialogDescription>
            This will end your current session and you will need to log in
            again to access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="text-white !bg-red-500" disabled={isPending} type="button" onClick={handleLogout}>
            {isPending && <Loader className="animate-spin" />}
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutDialog;