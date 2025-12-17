import { ColumnDef } from "@tanstack/react-table";
import { ICategory } from "@/types/api";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import CategoryFormDialog from "../category-form/category-form";
import { TruncatedText } from "../shared/truncated-text";
import { DeleteCategoryAlert } from "./delete-category-alert";
import { StatusBadge } from "../shared/status-badge";
import { CreatorCell } from "../shared/creator-cell";
import { TableActions } from "../shared/table-actions";
import { canManageProducts, canDelete } from "@/lib/utils";
import { useState } from "react";
import { IDialogType } from "@/types";

export const createCategoryColumns = (userRole?: string): ColumnDef<ICategory>[] => {
  const canEdit = canManageProducts(userRole);
  const canDeleteCategory = canDelete(userRole);
  const showActions = canEdit || canDeleteCategory;

  const columns: ColumnDef<ICategory>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => <div className="text-left">{row.original.name}</div>,
    size: 200,
    minSize: 150,
    maxSize: 300,
    meta: { align: "left" },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Description" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-left">
        <TruncatedText text={row.original.description} maxLength={50} />
      </div>
    ),
    size: 300,
    minSize: 200,
    maxSize: 500,
    meta: { align: "left" },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge isActive={row.original.isActive} />
      </div>
    ),
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: { align: "center" },
  },
  {
    accessorKey: "creator",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Created By" />
      </div>
    ),
    cell: ({ row }) => <CreatorCell creator={row.original.creator} align="center" />,
    size: 180,
    minSize: 150,
    maxSize: 250,
    meta: { align: "center" },
  },
  ];

  // Only add actions column if user has permissions
  if (showActions) {
    columns.push({
      id: "actions",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title="Actions" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ActionsRow 
            category={row.original} 
            canEdit={canEdit}
            canDelete={canDeleteCategory}
          />
        </div>
      ),
      enableSorting: false,
      size: 80,
      minSize: 80,
      maxSize: 100,
      meta: { align: "right" },
    });
  }

  return columns;
};

const ActionsRow = ({ 
  category,
  canEdit,
  canDelete: canDeleteCategory
}: { 
  category: ICategory;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  return (
    <TableActions
      canEdit={canEdit}
      canDelete={canDeleteCategory}
      onEdit={() => setDialogType("Update")}
      onDelete={() => setDialogType("Delete")}
      editDialog={
        dialogType === "Update" && (
          <CategoryFormDialog
            action="update"
            category={{
              name: category.name || "",
              description: category.description || "",
              isActive: category.isActive !== undefined ? category.isActive : true,
            }}
            categoryId={category.id}
          />
        )
      }
      deleteDialog={
        dialogType === "Delete" && (
          <DeleteCategoryAlert categoryId={category.id} />
        )
      }
    />
  );
};

