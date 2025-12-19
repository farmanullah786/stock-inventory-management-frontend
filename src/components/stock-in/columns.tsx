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
import { canDelete, canModifyInventory, formatDate, isAdminOrManager } from "@/lib/utils";
import { getStockInStatusBadge } from "@/lib/badge-helpers";
import { DeleteStockInAlert } from "./delete-stock-in-alert";
import { IDialogType } from "@/types";
import { useState } from "react";
import { TruncatedText } from "../shared/truncated-text";
import { CreatorCell } from "../shared/creator-cell";
import { useValidateStockIn } from "@/hooks/use-stock-in";
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
  products: IProduct[] = [],
  users: IUser[] = [],
  userRole?: string
): ColumnDef<IStockIn>[] => {
  const canEdit = canModifyInventory(userRole);
  const canDeleteStockIn = canDelete(userRole);
  const canValidate = isAdminOrManager(userRole);
  const showActions = canEdit || canDeleteStockIn || canValidate;

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
        <DataTableColumnHeader column={column} title="Reference" />
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
        <DataTableColumnHeader column={column} title="PO Number" />
      ),
      cell: ({ row }) => row.original.poNumber || "-",
    },
    {
      accessorKey: "purchaseRequest.prNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PR Number" />
      ),
      cell: ({ row }) => {
        const pr = row.original.purchaseRequest;
        if (!pr) return "-";
        return (
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
            {pr.prNumber}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getStockInStatusBadge(row.original.status || "validated"),
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
          canValidate={canValidate}
        />
      ),
      maxSize: 30,
    });
  }

  return columns;
};


const ValidateStockInDialog = ({
  stockInId,
  record,
}: {
  stockInId: number;
  record: IStockIn;
}) => {
  const validateMutation = useValidateStockIn();

  const handleValidate = () => {
    validateMutation.mutate(stockInId);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Validate Stock In</DialogTitle>
        <DialogDescription>
          Validate this stock in record. Stock will be added to inventory upon validation.
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
            Are you sure you want to validate this stock in record? This action will add the stock to inventory.
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
  canEdit,
  canDelete: canDeleteStockIn,
  canValidate,
}: {
  record: IStockIn;
  products: IProduct[];
  users: IUser[];
  canEdit: boolean;
  canDelete: boolean;
  canValidate: boolean;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

  const hasAnyAction = canEdit || canDeleteStockIn || canValidate;
  if (!hasAnyAction) return null;

  // Odoo-style: Only allow edit/delete for draft or validated status
  // Done and cancelled records should not be editable
  const canUpdate = (record.status === "draft" || record.status === "validated") && canEdit;
  const canDeleteRecord = (record.status === "draft" || record.status === "validated" || record.status === "cancelled") && canDeleteStockIn;
  const canValidateRecord = record.status === "draft" && canValidate;

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
            {canValidateRecord && (
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => handleDialogType("Validate")}>
                  Validate
                </DropdownMenuItem>
              </DialogTrigger>
            )}
            {canDeleteRecord && (
              <>
                {canUpdate && <DropdownMenuSeparator />}
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
            stockKeeperId: record.stockKeeperId,
            location: record.location || "",
            scheduledDate: record.scheduledDate || undefined,
            status: record.status || "validated",
            remarks: record.remarks,
          }}
          stockInId={record.id}
          products={products}
          users={users}
          recordStatus={record.status}
          referenceNumber={record.referenceNumber}
          purchaseRequestId={record.purchaseRequestId}
        />
      )}
      {dialogType === "Validate" && (
        <ValidateStockInDialog stockInId={record.id} record={record} />
      )}
    </Dialog>
  );
};
