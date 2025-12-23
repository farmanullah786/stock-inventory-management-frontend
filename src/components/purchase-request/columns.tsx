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
import { IPurchaseRequest, IProduct, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import PurchaseRequestFormDialog from "../purchase-request-form/purchase-request-form";
import { canDelete, canModifyInventory, formatDate, isAdminOrManager } from "@/lib/utils";
import { getPurchaseRequestStatusBadge, getPriorityBadge } from "@/lib/badge-helpers";
import { DeletePurchaseRequestAlert } from "./delete-purchase-request-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";
import { DEFAULT_CURRENCY } from "@/constants";
import {
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "@/hooks/use-purchase-request";
import GoodsReceiptFormDialog from "../goods-receipt-form/goods-receipt-form";
import { toast } from "sonner";


export const purchaseRequestColumns = (
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole: string
): ColumnDef<IPurchaseRequest>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeletePR = canDelete(userRole);
  const canApprove = isAdminOrManager(userRole);
  const showActions = canEdit || canDeletePR || canApprove;

  const columns: ColumnDef<IPurchaseRequest>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
      ),
      maxSize: 40,
    },
    {
      accessorKey: "prNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PR Number" className="min-w-[8rem]" />
      ),
      cell: ({ row }) => row.original.prNumber,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getPurchaseRequestStatusBadge(row.original.status),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => getPriorityBadge(row.original.priority),
    },
    {
      accessorKey: "totalEstimatedCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Cost" />
      ),
      cell: ({ row }) => {
        const cost = Number(row.original.totalEstimatedCost) || 0;
        const currency = row.original.currency || DEFAULT_CURRENCY;
        return `${cost.toFixed(2)} ${currency}`;
      },
    },
    {
      accessorKey: "requestedDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested Date" />
      ),
      cell: ({ row }) => formatDate(row.original.requestedDate),
    },
    {
      accessorKey: "requester",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested By" />
      ),
      cell: ({ row }) => {
        const requester = row.original.requester;
        if (!requester) return "-";
        return `${requester.firstName} ${requester.lastName || ""}`.trim();
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
    {
      accessorKey: "received",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received Status" />
      ),
      cell: ({ row }) => {
        const items = row.original.items || [];
        if (items.length === 0) return "-";
        
        // Convert to numbers and handle null/undefined/string values
        const totalOrdered = items.reduce((sum, item) => {
          const quantity = Number(item.quantity) || 0;
          return sum + quantity;
        }, 0);
        
        const totalReceived = items.reduce((sum, item) => {
          const quantityReceived = Number(item.quantityReceived) || 0;
          return sum + quantityReceived;
        }, 0);
        
        // Handle edge cases
        if (totalOrdered === 0 || isNaN(totalOrdered) || isNaN(totalReceived)) {
          return <Badge variant="outline">Not Received</Badge>;
        }
        
        if (totalReceived === 0) {
          return <Badge variant="outline">Not Received</Badge>;
        } else if (totalReceived >= totalOrdered) {
          return <Badge variant="default">Fully Received</Badge>;
        } else {
          const percentage = Math.round((totalReceived / totalOrdered) * 100);
          // Ensure percentage is a valid number
          if (isNaN(percentage) || !isFinite(percentage)) {
            return <Badge variant="outline">Not Received</Badge>;
          }
          return <Badge variant="secondary">{percentage}% Received</Badge>;
        }
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
          canDelete={canDeletePR}
          canApprove={canApprove}
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
  canDelete: canDeletePR,
  canApprove,
}: {
  record: IPurchaseRequest;
  products: IProduct[];
  users: IUser[];
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeletePR || canApprove;
  if (!hasAnyAction) return null;

  const canSubmit = record.status === "draft" && canEdit;
  const canApproveReject = record.status === "pending" && canApprove;
  const canCreateGR = record.status === "approved" && canEdit;

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
            {canEdit && (record.status === "draft" || record.status === "pending") && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canSubmit && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Submit")}>
                  Submit
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canApproveReject && (
              <>
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => handleDialogType("Approve")}>
                    Approve
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => handleDialogType("Reject")}>
                    Reject
                  </DropdownMenuItem>
                </DialogTrigger>
              </>
            )}
            {canCreateGR && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("CreateGR")}>
                  Create Goods Receipt
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canDeletePR && (record.status === "draft" || record.status === "rejected") && (
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
        {dialogType === "Delete" && canDeletePR && (
          <DeletePurchaseRequestAlert purchaseRequestId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <PurchaseRequestFormDialog
          action="update"
          purchaseRequest={record}
          products={products}
          users={users}
        />
      )}
      {(dialogType === "Submit" || dialogType === "Approve" || dialogType === "Reject") && (
        <PurchaseRequestFormDialog
          action={dialogType.toLowerCase() as any}
          purchaseRequest={record}
          products={products}
          users={users}
        />
      )}
      {dialogType === "CreateGR" && (
        <GoodsReceiptFormDialog
          action="create"
          products={products}
          users={users}
          purchaseRequest={record}
        />
      )}
    </Dialog>
  );
};

