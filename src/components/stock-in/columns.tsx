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
import { IStockIn } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import StockInFormDialog from "../stock-in-form/stock-in-form";
import { StockInFormData } from "@/schemas/stock-in-schema";
import { format } from "date-fns";
import { canDelete, canModifyInventory } from "@/lib/utils";
import { DeleteStockInAlert } from "./delete-stock-in-alert";
import { IDialogType } from "@/types";
import { useState } from "react";

export const createStockInColumns = (
  products: any[] = [],
  users: any[] = [],
  userRole?: string
): ColumnDef<IStockIn>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeleteStockIn = canDelete(userRole);
  const showActions = canEdit || canDeleteStockIn;

  const columns: ColumnDef<IStockIn>[] = [
  {
    accessorKey: "product.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => row.original.product?.name || "N/A",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    cell: ({ row }) => {
      const qty = row.original.quantity || 0;
      const unit = row.original.product?.unit || "";
      return `${Number(qty).toFixed(2)} ${unit}`;
    },
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit Price" />
    ),
    cell: ({ row }) => {
      const price = Number(row.original.unitPrice) || 0;
      return price.toFixed(2);
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Price" />
    ),
    cell: ({ row }) => {
      const price = Number(row.original.totalPrice) || 0;
      return price.toFixed(2);
    },
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => row.original.currency || "AFN",
  },
  {
    accessorKey: "poNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO Number" />
    ),
    cell: ({ row }) => row.original.poNumber || "-",
  },
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice N/O" />
    ),
    cell: ({ row }) => row.original.invoiceNo || "-",
  },
  {
    accessorKey: "vendorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor Name" />
    ),
    cell: ({ row }) => row.original.vendorName || "-",
  },
  {
    accessorKey: "grnNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="GRN N/O" />
    ),
    cell: ({ row }) => row.original.grnNo || "-",
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    cell: ({ row }) => row.original.year || "-",
  },
  {
    accessorKey: "month",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Month" />
    ),
    cell: ({ row }) => {
      const month = row.original.month;
      if (!month) return "-";
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return monthNames[month - 1] || "-";
    },
  },
  {
    accessorKey: "stockKeeper",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock Keeper" />
    ),
    cell: ({ row }) => {
      const keeper = row.original.stockKeeper;
      if (!keeper) return "-";
      return `${keeper.firstName} ${keeper.lastName || ""}`.trim();
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
            record={row.original}
            products={products}
            users={users}
            canEdit={canEdit}
            canDelete={canDeleteStockIn}
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
  record,
  products,
  users,
  canEdit,
  canDelete: canDeleteStockIn,
}: {
  record: IStockIn;
  products: any[];
  users: any[];
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteStockIn;
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
                <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canEdit && canDeleteStockIn && <DropdownMenuSeparator />}
            {canDeleteStockIn && (
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && canDeleteStockIn && (
          <DeleteStockInAlert stockInId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <StockInFormDialog
          action="update"
          stockIn={{
            productId: record.productId || record.product?.id || 0,
            date: record.date || new Date().toISOString().split("T")[0],
            quantity: record.quantity || 0,
            unitPrice: record.unitPrice || 0,
            totalPrice: record.totalPrice || 0,
            currency: record.currency || "AFN",
            poNumber: record.poNumber || "",
            invoiceNo: record.invoiceNo || "",
            vendorName: record.vendorName || "",
            grnNo: record.grnNo || "",
            year: record.year || new Date().getFullYear(),
            month: record.month || new Date().getMonth() + 1,
            stockKeeperId: record.stockKeeperId,
            remarks: record.remarks || "",
          }}
          stockInId={record.id}
          products={products}
          users={users}
        />
      )}
    </Dialog>
  );
};

