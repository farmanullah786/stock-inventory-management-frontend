import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICategory } from "@/types/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DataTableColumnHeader } from "../shared/data-table/data-table-column-header";
import CategoryFormDialog from "../category-form/category-form";
import { CategoryFormData } from "@/schemas/category-schema";
import { TruncatedText } from "../shared/truncated-text";
import { DeleteCategoryAlert } from "./delete-category-alert";
import { IDialogType } from "@/types";
import { useState } from "react";

export const createCategoryColumns = (): ColumnDef<ICategory>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => <div className="text-left">{row.original.name}</div>,
    size: 200,
    minSize: 150,
    maxSize: 300,
    meta: { align: "left" },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex justify-start">
        <DataTableColumnHeader column={column} title="Description" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-left">
        <TruncatedText text={row.original.description} maxLength={50} />
      </div>
    ),
    size: 300,
    minSize: 200,
    maxSize: 500,
    meta: { align: "left" },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: { align: "center" },
  },
  {
    accessorKey: "creator",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Created By" />
      </div>
    ),
    cell: ({ row }) => {
      const creator = row.original.creator;
      if (!creator) return <div className="text-center">-</div>;
      return (
        <div className="text-center">
          {`${creator.firstName} ${creator.lastName || ""}`.trim()}
        </div>
      );
    },
    size: 180,
    minSize: 150,
    maxSize: 250,
    meta: { align: "center" },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Actions" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ActionsRow category={row.original} />
      </div>
    ),
    enableSorting: false,
    size: 80,
    minSize: 80,
    maxSize: 100,
    meta: { align: "right" },
  },
];

const ActionsRow = ({ 
  category
}: { 
  category: ICategory;
}) => {
  const [dialogType, setDialogType] = useState<IDialogType>("None");

  const handleDialogType = (type: IDialogType) => setDialogType(type);

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
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Update")}>
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleDialogType("Delete")}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        {dialogType === "Delete" && (
          <DeleteCategoryAlert categoryId={category.id} />
        )}
      </AlertDialog>
      {dialogType === "Update" && (
        <CategoryFormDialog
          action="update"
          category={{
            name: category.name || "",
            description: category.description || "",
            isActive: category.isActive !== undefined ? category.isActive : true,
          }}
          categoryId={category.id}
        />
      )}
    </Dialog>
  );
};

