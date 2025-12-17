import { ColumnDef } from "@tanstack/react-table";
import { ICategory } from "@/types/api";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import CategoryFormDialog from "../category-form/category-form";
import { TruncatedText } from "../shared/truncated-text";
import { DeleteCategoryAlert } from "./delete-category-alert";
import { StatusBadge } from "../shared/status-badge";
import { CreatorCell } from "../shared/creator-cell";
import { canManageProducts, canDelete } from "@/lib/utils";
import { useState } from "react";
import { IDialogType } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const createCategoryColumns = (
  userRole?: string
): ColumnDef<ICategory>[] => {
  const canEdit = canManageProducts(userRole);
  const canDeleteCategory = canDelete(userRole);
  const showActions = canEdit || canDeleteCategory;

  const columns: ColumnDef<ICategory>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
      ),
      maxSize: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          className="text-left"
        />
      ),
      cell: ({ row }) => <div className="text-left">{row.original.name}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Description"
          className="text-left"
        />
      ),
      cell: ({ row }) => (
        <TruncatedText
          text={row.original.description}
          className="text-left block"
        />
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge isActive={row.original.isActive} />
        </div>
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
      accessorKey: "creator",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => (
        <CreatorCell creator={row.original.creator} align="center" />
      ),
    },
  ];

  // Only add actions column if user has permissions
  if (showActions) {
    columns.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title=""
          className="min-w-[3rem]"
        />
      ),
      cell: ({ row }) => (
        <ActionsRow
          category={row.original}
          canEdit={canEdit}
          canDelete={canDeleteCategory}
        />
      ),
      maxSize: 30,
    });
  }

  return columns;
};

const ActionsRow = ({
  category,
  canEdit,
  canDelete: canDeleteCategory,
}: {
  category: ICategory;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteCategory;
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

          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canEdit && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canDeleteCategory && (
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && canDeleteCategory && (
          <DeleteCategoryAlert categoryId={category.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <CategoryFormDialog
          action="update"
          category={{
            name: category.name || "",
            description: category.description || "",
            isActive:
              category.isActive !== undefined ? category.isActive : true,
          }}
          categoryId={category.id}
        />
      )}
    </Dialog>
  );
};
