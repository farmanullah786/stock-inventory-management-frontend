import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IProduct } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import ProductFormDialog from "../product-form/product-form";
import { ProductFormData } from "@/schemas/product-schema";
import { DeleteProductAlert } from "./delete-product-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";

export const createProductColumns = (): ColumnDef<IProduct>[] => [
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
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
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
    cell: ({ row }) => {
      const creator = row.original.creator;
      if (!creator) return <div className="text-center">-</div>;
      return (
        <div className="text-center">
          {`${creator.firstName} ${creator.lastName || ""}`.trim()}
        </div>
      );
    },
    size: 180,
    minSize: 150,
    maxSize: 250,
    meta: { align: "center" },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Actions" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ActionsRow product={row.original} />
      </div>
    ),
    enableSorting: false,
    size: 80,
    minSize: 80,
    maxSize: 100,
    meta: { align: "right" },
  },
];

const ActionsRow = ({ 
  product
}: { 
  product: IProduct;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  return (
    <Dialog>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-5"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && (
          <DeleteProductAlert productId={product.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
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
      )}
    </Dialog>
  );
};

