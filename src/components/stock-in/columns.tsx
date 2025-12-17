import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IStockIn, IProduct, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import StockInFormDialog from "../stock-in-form/stock-in-form";
import { canDelete, canModifyInventory, formatDate } from "@/lib/utils";
import { DeleteStockInAlert } from "./delete-stock-in-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";

export const createStockInColumns = (
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole?: string
): ColumnDef<IStockIn>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeleteStockIn = canDelete(userRole);
  const showActions = canEdit || canDeleteStockIn;

  const columns: ColumnDef<IStockIn>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
      ),
      maxSize: 40,
    },
    {
      accessorKey: "product.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Product"
          className="min-w-[10rem] text-left px-2.5"
        />
      ),

      cell: ({ row }) => <TruncatedText text={row.original.product.name} />,
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
        <DataTableColumnHeader
          column={column}
          title="Vendor Name"
          className="min-w-[8rem]"
        />
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
        <DataTableColumnHeader
          column={column}
          title="Stock Keeper"
          className="min-w-[8rem]"
        />
      ),
      cell: ({ row }) => {
        const keeper = row.original.stockKeeper;
        if (!keeper) return "-";
        return `${keeper.firstName} ${keeper.lastName || ""}`.trim();
      },
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
          record={row.original}
          products={products}
          users={users}
          canEdit={canEdit}
          canDelete={canDeleteStockIn}
        />
      ),
      maxSize: 30,
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
  products: IProduct[];
  users: IUser[];
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
            {/* {canEdit && canDeleteStockIn && <DropdownMenuSeparator />} */}
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
            productId: record.productId || record.product.id,
            date: record.date,
            quantity: record.quantity,
            unitPrice: record.unitPrice,
            totalPrice: record.totalPrice,
            currency: record.currency || "AFN",
            poNumber: record.poNumber,
            invoiceNo: record.invoiceNo,
            vendorName: record.vendorName,
            grnNo: record.grnNo,
            year: record.year,
            month: record.month,
            stockKeeperId: record.stockKeeperId,
            remarks: record.remarks,
          }}
          stockInId={record.id}
          products={products}
          users={users}
        />
      )}
    </Dialog>
  );
};
