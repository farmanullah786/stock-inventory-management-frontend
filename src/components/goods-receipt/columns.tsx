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
import { IGoodsReceipt, IProduct, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import GoodsReceiptFormDialog from "../goods-receipt-form/goods-receipt-form";
import { canDelete, canModifyInventory, formatDate, isAdminOrManager } from "@/lib/utils";
import { getGoodsReceiptStatusBadge, getConditionBadge } from "@/lib/badge-helpers";
import { DeleteGoodsReceiptAlert } from "./delete-goods-receipt-alert";
import { IDialogType } from "@/types";
import { useState } from "react";


export const goodsReceiptColumns = (
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole: string
): ColumnDef<IGoodsReceipt>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeleteGR = canDelete(userRole);
  const canVerify = isAdminOrManager(userRole);
  const showActions = canEdit || canDeleteGR || canVerify;

  const columns: ColumnDef<IGoodsReceipt>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
      ),
      maxSize: 40,
    },
    {
      accessorKey: "grnNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GRN Number" className="min-w-[8rem]" />
      ),
      cell: ({ row }) => row.original.grnNumber,
    },
    {
      accessorKey: "purchaseRequest",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PR Number" />
      ),
      cell: ({ row }) => {
        const pr = row.original.purchaseRequest;
        if (!pr) return "-";
        return (
          <div className="flex items-center gap-2">
            <span>{pr.prNumber}</span>
            {pr.items && pr.items.some((item) => (item.quantityReceived || 0) > 0) && (
              <Badge variant="outline" className="text-xs">
                Partial
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getGoodsReceiptStatusBadge(row.original.status),
    },
    {
      accessorKey: "condition",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Condition" />
      ),
      cell: ({ row }) => getConditionBadge(row.original.condition),
    },
    {
      accessorKey: "receivedDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received Date" />
      ),
      cell: ({ row }) => formatDate(row.original.receivedDate),
    },
    {
      accessorKey: "receiver",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received By" />
      ),
      cell: ({ row }) => {
        const receiver = row.original.receiver;
        if (!receiver) return "-";
        return `${receiver.firstName} ${receiver.lastName || ""}`.trim();
      },
    },
    {
      accessorKey: "items",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row }) => {
        const items = row.original.items || [];
        return items.length;
      },
    },
  ];

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
          canDelete={canDeleteGR}
          canVerify={canVerify}
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
  canDelete: canDeleteGR,
  canVerify,
}: {
  record: IGoodsReceipt;
  products: IProduct[];
  users: IUser[];
  canEdit: boolean;
  canDelete: boolean;
  canVerify: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteGR || canVerify;
  if (!hasAnyAction) return null;

  const canUpdate = (record.status === "pending" || record.status === "partial") && canEdit;
  const canVerifyGR = record.status !== "rejected" && !record.verifiedBy && canVerify;
  const canDeleteRecord = (record.status === "pending" || record.status === "rejected") && canDeleteGR;

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
            {canUpdate && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canVerifyGR && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Verify")}>
                  Verify
                </DropdownMenuItem>
              </DialogTrigger>
            )}
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
          <DeleteGoodsReceiptAlert goodsReceiptId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <GoodsReceiptFormDialog
          action="update"
          goodsReceipt={record}
          products={products}
          users={users}
        />
      )}
      {dialogType === "Verify" && (
        <GoodsReceiptFormDialog
          action="verify"
          goodsReceipt={record}
          products={products}
          users={users}
        />
      )}
    </Dialog>
  );
};

