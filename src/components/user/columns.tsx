import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { IDialogType } from "@/types";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { capitalizeWords, formatDate, getInitials } from "@/lib/utils";
import { UserForm } from "./user-form-dialog";
import { Badge } from "../ui/badge";
import { getRoleBadgeColor, getStatusBadgeColor } from "@/lib/utils";
import { useDeleteUser } from "@/hooks/use-user";
import { DeleteDialog } from "../shared/delete-dialog";

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" className="pl-2" />
    ),
    cell: ({ row }) => {
      const { firstName, lastName, email, imageUrl } = row.original;

      return (
        <div className="flex items-center space-x-3 pl-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={imageUrl || undefined} />
            <AvatarFallback>
              {getInitials(firstName, lastName || "")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {`${firstName} ${lastName || ""}`.trim()}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge variant={getRoleBadgeColor(role) as any} className="text-xs">
          {capitalizeWords(role)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeColor(row.original.status) as any}>
        {capitalizeWords(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title=""
        className="min-w-[.5rem]"
      />
    ),
    cell: ({ row }) => <ActionsRow user={row.original} />,
    maxSize: 30,
  },
];

const ActionsRow = ({ user }: { user: IUser }) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");
  const deleteUserMutation = useDeleteUser();

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id);
  };

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
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && (
          <DeleteDialog
            title="Delete User"
            description={`This action cannot be undone. This will permanently delete the user account for ${user.firstName} ${user.lastName}.`}
            warningMessage="Warning: This action cannot be undone. Are you sure you want to continue?"
            onConfirm={handleDelete}
            isPending={deleteUserMutation.isPending}
          />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <UserForm
          action="update"
          user={{
            imageUrl: user.imageUrl || "",
            firstName: user.firstName,
            lastName: user.lastName || "",
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            role: user.role as
              | "admin"
              | "stock_manager"
              | "stock_keeper"
              | "viewer",
            status: user.status as "active" | "inactive",
          }}
          userId={user.id}
        />
      )}
    </Dialog>
  );
};
