import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { IStockSummary } from "@/types/api";

export const stockSummaryColumns: ColumnDef<IStockSummary>[] = [
  {
    // First column - Left aligned
    accessorKey: "productName",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Product Name" />
      </div>
    ),
    cell: ({ row }) => <div className="text-left">{row.original.productName}</div>,
  },
  {
    // Middle column - Center aligned
    accessorKey: "category",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Category" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline">{row.original.category || '-'}</Badge>
      </div>
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "openingStock",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Opening Stock" />
      </div>
    ),
    cell: ({ row }) => {
      const stock = Number(row.original.openingStock) || 0;
      return <div className="text-center">{Math.floor(stock).toString()}</div>;
    },
  },
  {
    // Middle column - Center aligned
    accessorKey: "totalIn",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Total Stock In" />
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.totalIn.toFixed(2)}</div>,
  },
  {
    // Middle column - Center aligned
    accessorKey: "totalOut",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Total Stock Out" />
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.totalOut.toFixed(2)}</div>,
  },
  {
    // Middle column - Center aligned
    accessorKey: "availableStock",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Available Stock" />
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.availableStock.toFixed(2)}</div>,
  },
  {
    // Middle column - Center aligned
    accessorKey: "unit",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Unit" />
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.unit || '-'}</div>,
  },
  {
    // Last column - Right aligned
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => {
      const stock = row.original.availableStock;
      return (
        <div className="flex justify-end">
          {stock <= 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : stock < 10 ? (
            <Badge className="bg-warning-bg text-warning-text hover:bg-warning-bg border-warning-border">Low</Badge>
          ) : (
            <Badge className="bg-success-bg text-success hover:bg-success-bg border-success">In Stock</Badge>
          )}
        </div>
      );
    },
  },
];

