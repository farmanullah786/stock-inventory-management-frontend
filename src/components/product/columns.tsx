import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/types/api";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import ProductFormDialog from "../product-form/product-form";
import { DeleteProductAlert } from "./delete-product-alert";
import { TruncatedText } from "../shared/truncated-text";
import { StatusBadge } from "../shared/status-badge";
import { CreatorCell } from "../shared/creator-cell";
import { TableActions } from "../shared/table-actions";
import { canManageProducts, canDelete } from "@/lib/utils";
import { useState } from "react";
import { IDialogType } from "@/types";

export const createProductColumns = (userRole?: string): ColumnDef<IProduct>[] => {
  const canEdit = canManageProducts(userRole);
  const canDeleteProduct = canDelete(userRole);
  const showActions = canEdit || canDeleteProduct;

  const columns: ColumnDef<IProduct>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-left">
        <TruncatedText text={row.original.name} maxLength={30} />
      </div>
    ),
    size: 200,
    minSize: 150,
    maxSize: 300,
    meta: { align: "left" },
  },
  {
    accessorKey: "category.name",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Category" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline">{row.original.category?.name || "N/A"}</Badge>
      </div>
    ),
    size: 150,
    minSize: 120,
    maxSize: 200,
    meta: { align: "center" },
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Unit" />
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.unit || "-"}</div>,
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: { align: "center" },
  },
  {
    accessorKey: "openingStock",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Opening Stock" />
      </div>
    ),
    cell: ({ row }) => {
      const stock = Number(row.original.openingStock) || 0;
      return <div className="text-center">{Math.floor(stock).toString()}</div>;
    },
    size: 140,
    minSize: 120,
    maxSize: 180,
    meta: { align: "center" },
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
          <ActionsRow product={row.original} canEdit={canEdit} canDelete={canDeleteProduct} />
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
  product,
  canEdit,
  canDelete: canDeleteProduct
}: { 
  product: IProduct;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  return (
    <TableActions
      canEdit={canEdit}
      canDelete={canDeleteProduct}
      onEdit={() => setDialogType("Update")}
      onDelete={() => setDialogType("Delete")}
      editDialog={
        dialogType === "Update" && (
          <ProductFormDialog
            action="update"
            product={{
              name: product.name || "",
              categoryId: product.categoryId || product.category?.id || 0,
              unit: product.unit || "pcs",
              description: product.description || "",
              openingStock: product.openingStock || 0,
              isActive: product.isActive !== undefined ? product.isActive : true,
            }}
            productId={product.id}
          />
        )
      }
      deleteDialog={
        dialogType === "Delete" && (
          <DeleteProductAlert productId={product.id} />
        )
      }
    />
  );
};

