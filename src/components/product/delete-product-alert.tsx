import { DeleteDialog } from "../shared/delete-dialog";
import { useDeleteProduct } from "@/hooks/use-products";

export const DeleteProductAlert = ({
  productId,
}: {
  productId: number;
}) => {
  const { mutate, isPending } = useDeleteProduct();

  const handleDelete = () => {
    mutate(productId);
  };

  return (
    <DeleteDialog
      title="Delete Product"
      description="This action cannot be undone. This will permanently delete the product and all related stock records."
      warningMessage="Warning: This action cannot be undone. Are you sure you want to continue?"
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

