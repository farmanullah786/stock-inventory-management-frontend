import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import { IStockSummary } from "@/types/api";
import { TruncatedText } from "../shared/truncated-text";

export const stockSummaryColumns: ColumnDef<IStockSummary>[] = [
  {
    accessorKey: "productId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" className="min-w-5" />
    ),
    maxSize: 40,
  },
  {
    // First column - Left aligned
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Product Name"
        className="min-w-[10rem] text-left"
      />
    ),
    cell: ({ row }) => (
      <TruncatedText
        text={row.original.productName}
        className="text-left block"
      />
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[8rem]">
        <Badge variant="outline">{row.original.category || "-"}</Badge>
      </div>
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "openingStock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Opening Stock" />
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
      <DataTableColumnHeader column={column} title="Total Stock In" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.totalIn.toFixed(2)}</div>
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "totalOut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Stock Out" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.totalOut.toFixed(2)}</div>
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "availableStock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Available Stock" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.availableStock.toFixed(2)}
      </div>
    ),
  },
  {
    // Middle column - Center aligned
    accessorKey: "unit",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Unit" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.unit || "-"}</div>
    ),
  },
  {
    // Last column - Right aligned
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const stock = row.original.availableStock;
      return (
        <div className="flex justify-center">
          {stock <= 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : stock < 10 ? (
            <Badge className="bg-warning-bg text-warning-text hover:bg-warning-bg border-warning-border">
              Low
            </Badge>
          ) : (
            <Badge className="bg-success-bg text-success hover:bg-success-bg border-success">
              In Stock
            </Badge>
          )}
        </div>
      );
    },
  },
];
