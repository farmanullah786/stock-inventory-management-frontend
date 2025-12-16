import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/store/use-user-store";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@/hooks/use-auth";

const LogoutDialog = () => {
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const { logout } = useUser();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    await logout(queryClient);
  };

  return (
    <AlertDialogContent className="border-destructive/50 p-0">
      <AlertDialogHeader className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDialogTitle className="text-destructive">
            End Session
          </AlertDialogTitle>
        </div>
      </AlertDialogHeader>
      <div className="flex-1 overflow-y-auto px-6">
        <AlertDialogDescription className="text-muted-foreground">
          This action will terminate your current session and remove all
          authentication tokens. You will need to sign in again to access your
          account.
          <br />
          <br />
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-destructive font-medium">
              Warning: Any unsaved work may be lost. Are you sure you want to
              continue?
            </span>
          </div>
        </AlertDialogDescription>
      </div>
      <AlertDialogFooter className="px-6 py-4 border-t bg-background">
        <AlertDialogCancel className="bg-background hover:bg-muted">
          Keep Session Active
        </AlertDialogCancel>
        <Button onClick={handleLogout} disabled={logoutMutation.isPending}>
          End Session
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default LogoutDialog;
