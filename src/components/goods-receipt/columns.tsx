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
import { IGoodsReceipt, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { GoodsReceiptActions } from "./goods-receipt-actions";
import {
  canDelete,
  canModifyInventory,
  formatDate,
  isAdminOrManager,
} from "@/lib/utils";
import {
  getGoodsReceiptStatusBadge,
  getConditionBadge,
} from "@/lib/badge-helpers";
import { DeleteGoodsReceiptAlert } from "./delete-goods-receipt-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";

export const goodsReceiptColumns = (
  users: IUser[] = [],
  currentUser: IUser | null
): ColumnDef<IGoodsReceipt>[] => {
  const canEdit = currentUser ? canModifyInventory(currentUser.role) : false;
  const canDeleteGR = currentUser ? canDelete(currentUser.role) : false;
  const canVerify = currentUser ? isAdminOrManager(currentUser.role) : false;
  // Show "Received By" column only for Admins and Managers (who see all receipts)
  // Hide for Stock Keepers (who only see their own receipts)
  const showReceiverColumn = currentUser ? isAdminOrManager(currentUser.role) : false;

  const columns: ColumnDef<IGoodsReceipt>[] = [
    {
      accessorKey: "grnNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="GRN Number"
          className="min-w-[8rem]"
        />
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
        return pr.prNumber;
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
      accessorKey: "verifiedBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verified" />
      ),
      cell: ({ row }) => {
        const verified = row.original.verifiedBy;
        return verified ? (
          <Badge variant="default" className="bg-green-500 text-white border-transparent">
            Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">
            Not Verified
          </Badge>
        );
      },
    },
    {
      accessorKey: "verifier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verified By" />
      ),
      cell: ({ row }) => {
        const verifier = row.original.verifier;
        if (!verifier) return "-";
        return `${verifier.firstName} ${verifier.lastName || ""}`.trim();
      },
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
  ];

  // Conditionally add "Received By" column only for Admins and Managers
  if (showReceiverColumn) {
    columns.push({
      accessorKey: "receiver",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received By" />
      ),
      cell: ({ row }) => {
        const receiver = row.original.receiver;
        if (!receiver) return "-";
        return `${receiver.firstName} ${receiver.lastName || ""}`.trim();
      },
    });
  }

  columns.push({
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => {
      const items = row.original.items || [];
      return items.length;
    },
  });

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
        canEdit={canEdit}
        canDelete={canDeleteGR}
        canVerify={canVerify}
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
  canEdit,
  canDelete: canDeleteGR,
  canVerify,
  currentUser,
}: {
  record: IGoodsReceipt;
  users: IUser[];
  canEdit: boolean;
  canDelete: boolean;
  canVerify: boolean;
  currentUser: IUser | null;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");
  const navigate = useNavigate();

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const handleEdit = () => {
    navigate(
      `${routesConfig.app.editGoodsReceipt.replace(
        ":id",
        record.id.toString()
      )}`
    );
  };


  // Only the creator (receiver/owner) can edit their own goods receipt, and only when not verified
  const canUpdate =
    canEdit &&
    currentUser &&
    record.receivedBy === currentUser.id &&
    !record.verifiedBy; // Cannot edit if already verified
  const canVerifyGR =
    record.status !== "rejected" && !record.verifiedBy && canVerify;
  // Only the creator (receiver) can delete their own goods receipt
  const canDeleteRecord =
    record.status === "pending" &&
    canDeleteGR &&
    currentUser &&
    record.receivedBy === currentUser.id;

  // Always show actions menu since "View Details" should always be available
  // Other actions are conditionally shown inside the menu
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
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `${routesConfig.app.goodsReceiptDetail.replace(
                    ":id",
                    record.id.toString()
                  )}`
                )
              }
            >
              View Details
            </DropdownMenuItem>
            {canUpdate && (
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
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
                  <DropdownMenuItem className="text-primary" onClick={() => handleDialogType("Delete")}>
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
      {dialogType === "Verify" && canVerifyGR && (
        <GoodsReceiptActions goodsReceipt={record} />
      )}
    </Dialog>
  );
};
