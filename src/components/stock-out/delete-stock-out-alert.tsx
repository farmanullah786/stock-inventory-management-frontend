import { DeleteDialog } from "../shared/delete-dialog";
import { useDeleteStockOut } from "@/hooks/use-stock-out";

export const DeleteStockOutAlert = ({
  stockOutId,
}: {
  stockOutId: number;
}) => {
  const { mutate, isPending } = useDeleteStockOut();

  const handleDelete = () => {
    mutate(stockOutId);
  };

  return (
    <DeleteDialog
      title="Delete Stock Out Record"
      description="This action cannot be undone. This will permanently delete the stock out record."
      warningMessage="Warning: This action cannot be undone. Are you sure you want to continue?"
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

