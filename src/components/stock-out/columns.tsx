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
import { IStockOut, IProduct, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import StockOutFormDialog from "../stock-out-form/stock-out-form";
import { canDelete, canModifyInventory, formatDate } from "@/lib/utils";
import { DeleteStockOutAlert } from "./delete-stock-out-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";

export const createStockOutColumns = (
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole?: string
): ColumnDef<IStockOut>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeleteStockOut = canDelete(userRole);
  const showActions = canEdit || canDeleteStockOut;

  const columns: ColumnDef<IStockOut>[] = [
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
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDate(row.original.date),
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
          canDelete={canDeleteStockOut}
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
  canDelete: canDeleteStockOut,
}: {
  record: IStockOut;
  products: IProduct[];
  users: IUser[];
  canEdit: boolean;
  canDelete: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteStockOut;
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
            {/* {canEdit && canDeleteStockOut && <DropdownMenuSeparator />} */}
            {canDeleteStockOut && (
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && canDeleteStockOut && (
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
