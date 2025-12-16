import { DeleteDialog } from "../shared/delete-dialog";
import { useDeleteStockIn } from "@/hooks/use-stock-in";

export const DeleteStockInAlert = ({
  stockInId,
}: {
  stockInId: number;
}) => {
  const { mutate, isPending } = useDeleteStockIn();

  const handleDelete = () => {
    mutate(stockInId);
  };

  return (
    <DeleteDialog
      title="Delete Stock In Record"
      description="This action cannot be undone. This will permanently delete the stock in record."
      warningMessage="Warning: This action cannot be undone. Are you sure you want to continue?"
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

