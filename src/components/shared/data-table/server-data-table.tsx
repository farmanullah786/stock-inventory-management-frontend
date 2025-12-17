import * as React from "react";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import DataTablePagination from "./data-table-pagination";
import { SetURLSearchParams } from "react-router-dom";
import { cn, getCommonPinningStyles } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingOverlay from "@/components/ui/loading-overlay";

interface ServerDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  rowCount?: number;
  isFetching?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  searchParams,
  setSearchParams,
  rowCount,
  className,
  isFetching,
  footer,
}: ServerDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: (Number(searchParams.get("page")) || 1) - 1,
    pageSize: Number(searchParams.get("limit")) || 10,
  };

  const memoizedColumns = React.useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: data,
    columns: memoizedColumns,
    state: {
      sorting,
      pagination,
    },
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    rowCount: rowCount,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return;

      const { pageIndex, pageSize } = updater(table.getState().pagination);

      searchParams.set("page", (Number(pageIndex) + 1).toString());
      searchParams.set("limit", pageSize.toString());
      setSearchParams(searchParams);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className={cn("space-y-4 bg-bg border rounded-md", className)}>
      <div className="relative overflow-hidden rounded-md border-b rounded-b-none">
        <LoadingOverlay isFetching={isFetching} />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="font-semibold bg-bg-gray border-b border-border"
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirst = index === 0;
                  const isLast = index === headerGroup.headers.length - 1;
                  const alignmentClass = isFirst
                    ? "text-left"
                    : isLast
                    ? "text-right"
                    : "text-center";

                  return (
                    <TableHead
                      key={header.id}
                      className={`font-semibold odoo-text text-text-muted w-full ${alignmentClass}`}
                      style={{
                        width: header.getSize(),
                        ...getCommonPinningStyles({
                          column: header.column,
                        }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn(index % 2 === 0 ? "bg-bg" : "bg-bg-gray")}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFirst = cellIndex === 0;
                    const isLast =
                      cellIndex === row.getVisibleCells().length - 1;
                    const alignmentClass = isFirst
                      ? "text-left"
                      : isLast
                      ? "text-right"
                      : "text-center";

                    return (
                      <TableCell
                        key={cell.id}
                        className={alignmentClass}
                        style={{
                          ...getCommonPinningStyles({
                            column: cell.column,
                          }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center odoo-text text-text-muted"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {footer && <TableFooter>{footer}</TableFooter>}
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
