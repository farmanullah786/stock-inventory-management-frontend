import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/types/api";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import ProductFormDialog from "../product-form/product-form";
import { DeleteProductAlert } from "./delete-product-alert";
import { TruncatedText } from "../shared/truncated-text";
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

export const productColumns = (
  userRole: string
): ColumnDef<IProduct>[] => {
  const canEdit = canManageProducts(userRole);
  const canDeleteProduct = canDelete(userRole);
  const showActions = canEdit || canDeleteProduct;

  const columns: ColumnDef<IProduct>[] = [
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
          className="text-left min-w-[10rem]"
        />
      ),

      cell: ({ row }) => (
        <TruncatedText text={row.original.name} className="text-left block" />
      ),
    },
    {
      accessorKey: "category.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">
            {row.original.category?.name || "N/A"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unit" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.original.unit || "-"}</div>
      ),
    },
    {
      accessorKey: "openingStock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Opening Stock" />
      ),
      cell: ({ row }) => {
        const stock = Number(row.original.openingStock) || 0;
        return (
          <div className="text-center">{Math.floor(stock).toString()}</div>
        );
      },
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
          product={row.original}
          canEdit={canEdit}
          canDelete={canDeleteProduct}
        />
      ),
      maxSize: 30,
    });
  }

  return columns;
};

const ActionsRow = ({
  product,
  canEdit,
  canDelete: canDeleteProduct,
}: {
  product: IProduct;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteProduct;
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
            {canDeleteProduct && (
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && canDeleteProduct && (
          <DeleteProductAlert productId={product.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <ProductFormDialog
          action="update"
          product={{
            name: product.name,
            categoryId: product.categoryId || product.category?.id,
            unit: product.unit || "pcs",
            description: product.description,
            openingStock: product.openingStock,
            isActive: product.isActive !== undefined ? product.isActive : true,
          }}
          productId={product.id}
        />
      )}
    </Dialog>
  );
};
