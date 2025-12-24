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
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { canDelete, formatDate, isAdminOrManager } from "@/lib/utils";
import { getStockOutStatusBadge } from "@/lib/badge-helpers";
import { DeleteStockOutAlert } from "./delete-stock-out-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";
import { useValidateStockOut } from "@/hooks/use-stock-out";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "@/config/routes-config";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";


export const stockOutColumns = (
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole: string
): ColumnDef<IStockOut>[] => {
  const canDeleteStockOut = canDelete(userRole);
  const canValidate = isAdminOrManager(userRole);
  const showActions = canDeleteStockOut || canValidate;

  const columns: ColumnDef<IStockOut>[] = [
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
        <DataTableColumnHeader column={column} title="Reference" className="min-w-[8rem]"/>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.referenceNumber || "-"}
        </Badge>
      ),
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getStockOutStatusBadge(row.original.status || "draft"),
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
          canDelete={canDeleteStockOut}
          canValidate={canValidate}
        />
      ),
      maxSize: 30,
    });
  }

  return columns;
};

const ValidateStockOutDialog = ({
  stockOutId,
  record,
}: {
  stockOutId: number;
  record: IStockOut;
}) => {
  const validateMutation = useValidateStockOut();

  const handleValidate = () => {
    validateMutation.mutate(stockOutId);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Validate Stock Out</DialogTitle>
        <DialogDescription>
          Validate this stock out record. Stock will be deducted upon validation.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Product:</strong> {record.product?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Quantity:</strong> {record.quantity} {record.product?.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to validate this stock out record? This action will deduct the stock from inventory.
          </p>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleValidate} disabled={validateMutation.isPending}>
          {validateMutation.isPending ? "Validating..." : "Validate"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ActionsRow = ({
  record,
  products,
  users,
  canDelete: canDeleteStockOut,
  canValidate,
}: {
  record: IStockOut;
  products: IProduct[];
  users: IUser[];
  canDelete: boolean;
  canValidate: boolean;
}) => {
  const navigate = useNavigate();
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const handleViewDetails = () => {
    navigate(
      `${routesConfig.app.stockOutDetail.replace(":id", record.id.toString())}`
    );
  };

  const canValidateRecord = (record.status === "draft" || record.status === "ready") && !record.validatedBy && canValidate;
  const canDeleteRecord = (record.status === "draft" || record.status === "ready") && canDeleteStockOut;

  // Always show actions menu since "View Details" should always be available
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
            {canValidateRecord && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Validate")}>
                  Validate
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
          <DeleteStockOutAlert stockOutId={record.id} />
        )}
      </AlertDialog>
      {dialogType === "Validate" && (
        <ValidateStockOutDialog stockOutId={record.id} record={record} />
      )}
    </Dialog>
  );
};
