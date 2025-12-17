import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { IDialogType } from "@/types";

interface TableActionsProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editDialog?: ReactNode;
  deleteDialog?: ReactNode;
}

export const TableActions = ({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  editDialog,
  deleteDialog,
}: TableActionsProps) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const hasAnyAction = canEdit || canDelete;
  if (!hasAnyAction) return null;

  return (
    <Dialog>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {canEdit && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => {
                  setDialogType("Update");
                  onEdit();
                }}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canEdit && canDelete && <DropdownMenuSeparator />}
            {canDelete && (
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onClick={() => {
                  setDialogType("Delete");
                  onDelete();
                }}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {dialogType === "Delete" && canDelete && deleteDialog}
        {dialogType === "Update" && canEdit && editDialog}
      </AlertDialog>
    </Dialog>
  );
};

