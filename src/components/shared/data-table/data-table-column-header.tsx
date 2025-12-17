import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column?: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className={cn("odoo-text font-semibold text-text-muted min-w-[5rem] max-w-[10rem]", className)}>
      {title}
    </div>
  );
}

