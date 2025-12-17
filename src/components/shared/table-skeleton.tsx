import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function TableSkeleton({
  columnCount = 7,
  rowCount = 10,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4 bg-white border rounded-md blur-sm">
      <div className="relative overflow-hidden rounded-md border-b rounded-b-none">
        <Table>
          <TableHeader>
            <TableRow className="font-semibold bg-bg-gray border-b border-border">
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead
                  key={index}
                  className={`font-semibold odoo-text text-text-muted w-full ${
                    index === 0
                      ? "text-left"
                      : index === columnCount - 1
                      ? "text-right"
                      : "text-center"
                  }`}
                >
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-bg" : "bg-bg-gray"}
              >
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className={
                      cellIndex === 0
                        ? "text-left"
                        : cellIndex === columnCount - 1
                        ? "text-right"
                        : "text-center"
                    }
                  >
                    <Skeleton
                      className={`h-4 ${
                        cellIndex === 0
                          ? "w-12"
                          : cellIndex === columnCount - 1
                          ? "w-16"
                          : "w-24"
                      }`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full flex-col-reverse items-center md:justify-end gap-4 md:flex-row md:gap-8 px-4 pb-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-[70px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

