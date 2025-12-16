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
import { IStockOut } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import StockOutFormDialog from "../stock-out-form/stock-out-form";
import { StockOutFormData } from "@/schemas/stock-out-schema";
import { format } from "date-fns";
import { canDelete } from "@/lib/utils";
import { DeleteStockOutAlert } from "./delete-stock-out-alert";
import { IDialogType } from "@/types";
import { useState } from "react";

export const createStockOutColumns = (
  products: any[] = [],
  users: any[] = [],
  userRole?: string
): ColumnDef<IStockOut>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.date;
      return date ? format(new Date(date), "MMM dd, yyyy") : "N/A";
    },
  },
  {
    accessorKey: "product.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => row.original.product?.name || "N/A",
  },
  {
    accessorKey: "product.category.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.product?.category?.name || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => Number(row.original.quantity).toFixed(2),
  },
  {
    accessorKey: "product.unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
    cell: ({ row }) => row.original.product?.unit || "N/A",
  },
  {
    accessorKey: "issuedTo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Issued To" />
    ),
    cell: ({ row }) => {
      const issuedTo = row.original.issuedTo;
      if (!issuedTo) return "-";
      return `${issuedTo.firstName} ${issuedTo.lastName || ""}`.trim();
    },
  },
  {
    accessorKey: "site",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Site" />
    ),
    cell: ({ row }) => row.original.site || "-",
  },
  {
    accessorKey: "technician",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Technician" />
    ),
    cell: ({ row }) => {
      const technician = row.original.technician;
      if (!technician) return "-";
      return `${technician.firstName} ${technician.lastName || ""}`.trim();
    },
  },
  {
    accessorKey: "creator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const creator = row.original.creator;
      if (!creator) return "-";
      return `${creator.firstName} ${creator.lastName || ""}`.trim();
    },
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
        <ActionsRow
          record={row.original}
          products={products}
          users={users}
          userRole={userRole}
        />
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
  record,
  products,
  users,
  userRole,
}: {
  record: IStockOut;
  products: any[];
  users: any[];
  userRole?: string;
}) => {
  const showDelete = canDelete(userRole);
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

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
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            {showDelete && (
              <>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && showDelete && (
          <DeleteStockOutAlert stockOutId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <StockOutFormDialog
          action="update"
          stockOut={{
            productId: record.productId || record.product?.id || 0,
            date: record.date || new Date().toISOString().split("T")[0],
            quantity: record.quantity || 0,
            issuedToId: record.issuedToId,
            site: record.site || "",
            technicianId: record.technicianId,
            remarks: record.remarks || "",
          }}
          stockOutId={record.id}
          products={products}
          users={users}
        />
      )}
    </Dialog>
  );
};

