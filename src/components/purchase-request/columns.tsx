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
import { IPurchaseRequest, IUser } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { PurchaseRequestActions } from "./purchase-request-actions";
import { canModifyInventory, formatDate, isAdminOrManager } from "@/lib/utils";
import {
  getPurchaseRequestStatusBadge,
  getPriorityBadge,
} from "@/lib/badge-helpers";
import { DeletePurchaseRequestAlert } from "./delete-purchase-request-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";
import { DEFAULT_CURRENCY } from "@/constants";

export const purchaseRequestColumns = (
  users: IUser[] = [],
  currentUser: IUser | null
): ColumnDef<IPurchaseRequest>[] => {
  const canEdit = currentUser ? canModifyInventory(currentUser.role) : false;
  const canApprove = currentUser ? isAdminOrManager(currentUser.role) : false;
  // Show "Requested By" column only for Admins and Managers (who see all requests)
  // Hide for Stock Keepers (who only see their own requests)
  const showRequesterColumn = currentUser
    ? isAdminOrManager(currentUser.role)
    : false;

  const columns: ColumnDef<IPurchaseRequest>[] = [
    {
      accessorKey: "prNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="PR Number"
          className="min-w-[8rem]"
        />
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
      accessorKey: "requestedDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested Date" />
      ),
      cell: ({ row }) => formatDate(row.original.requestedDate),
    },
  ];

  // Conditionally add "Requested By" column only for Admins and Managers
  if (showRequesterColumn) {
    columns.push({
      accessorKey: "requester",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested By" />
      ),
      cell: ({ row }) => {
        const requester = row.original.requester;
        if (!requester) return "-";
        return `${requester.firstName} ${requester.lastName || ""}`.trim();
      },
    });
  }

  // Add remaining columns
  columns.push(
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
    }
  );

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
        canApprove={canApprove}
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
  canApprove,
  currentUser,
}: {
  record: IPurchaseRequest;
  users: IUser[];
  canEdit: boolean;
  canApprove: boolean;
  currentUser: IUser | null;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");
  const navigate = useNavigate();

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const handleEdit = () => {
    navigate(
      `${routesConfig.app.editPurchaseRequest.replace(
        ":id",
        record.id.toString()
      )}`
    );
  };

  // Only the creator can edit their own draft purchase request
  const canUpdate =
    record.status === "draft" &&
    currentUser &&
    record.requestedBy === currentUser.id &&
    canEdit;
  // Only the creator can submit their own draft purchase request
  const canSubmit =
    record.status === "draft" &&
    currentUser &&
    record.requestedBy === currentUser.id &&
    canEdit;
  const canApproveReject = record.status === "pending" && canApprove;
  // Only the creator can delete their own draft purchase request
  const canDeleteRecord =
    record.status === "draft" &&
    currentUser &&
    record.requestedBy === currentUser.id;

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
                  `${routesConfig.app.purchaseRequestDetail.replace(
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
            {canDeleteRecord && (
              <>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-primary"
                    onClick={() => handleDialogType("Delete")}
                  >
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {dialogType === "Delete" && canDeleteRecord && (
          <DeletePurchaseRequestAlert purchaseRequestId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Submit" && (
        <PurchaseRequestActions action="submit" purchaseRequest={record} />
      )}
      {dialogType === "Approve" && (
        <PurchaseRequestActions action="approve" purchaseRequest={record} />
      )}
      {dialogType === "Reject" && (
        <PurchaseRequestActions action="reject" purchaseRequest={record} />
      )}
    </Dialog>
  );
};
