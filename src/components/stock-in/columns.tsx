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
import { canDelete, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";
import { DeleteStockInAlert } from "./delete-stock-in-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";
import { DEFAULT_CURRENCY } from "@/constants";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";

export const stockInColumns = (
  users: IUser[] = [],
  currentUser: IUser | null
): ColumnDef<IStockIn>[] => {
  const canDeleteStockIn = currentUser ? canDelete(currentUser.role) : false;

  const columns: ColumnDef<IStockIn>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
      ),
      maxSize: 40,
    },
    {
      accessorKey: "referenceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Reference"
          className="min-w-[8rem]"
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.referenceNumber || "-"}</Badge>
      ),
    },
    {
      accessorKey: "product.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Product"
          className="min-w-[10rem]"
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
      cell: ({ row }) => row.original.currency || DEFAULT_CURRENCY,
    },
    {
      accessorKey: "poNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="PO Number"
          className="min-w-[8rem]"
        />
      ),
      cell: ({ row }) => row.original.poNumber || "-",
    },
    {
      accessorKey: "goodsReceipt.purchaseRequest.prNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="PR Number"
          className="min-w-[8rem]"
        />
      ),
      cell: ({ row }) => {
        const pr = row.original.goodsReceipt?.purchaseRequest;
        if (!pr) return "-";
        return (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
          >
            {pr.prNumber}
          </Badge>
        );
      },
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
        <DataTableColumnHeader
          column={column}
          title="GRN N/O"
          className="min-w-[8rem]"
        />
      ),
      cell: ({ row }) => row.original.grnNo || "-",
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

  // Always add actions column so users can view details
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
        users={users}
        canDelete={canDeleteStockIn}
        currentUser={currentUser}
      />
    ),
    maxSize: 30,
  });

  return columns;
};

const ActionsRow = ({
  record,
  users,
  canDelete: canDeleteStockIn,
  currentUser,
}: {
  record: IStockIn;
  users: IUser[];
  canDelete: boolean;
  currentUser: IUser | null;
}) => {
  const navigate = useNavigate();
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const handleViewDetails = () => {
    navigate(
      `${routesConfig.app.stockInDetail.replace(":id", record.id.toString())}`
    );
  };

  const canDeleteRecord =
    (record.status === "validated" ||
      record.status === "cancelled") &&
    canDeleteStockIn;

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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewDetails}>
              View Details
            </DropdownMenuItem>
            {canDeleteRecord && (
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

        {dialogType === "Delete" && canDeleteRecord && (
          <DeleteStockInAlert stockInId={record.id} />
        )}
      </AlertDialog>
    </Dialog>
  );
};
