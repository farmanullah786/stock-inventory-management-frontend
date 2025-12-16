import { DeleteDialog } from "../shared/delete-dialog";
import { useDeleteCategory } from "@/hooks/use-categories";

export const DeleteCategoryAlert = ({
  categoryId,
}: {
  categoryId: number;
}) => {
  const { mutate, isPending } = useDeleteCategory();

  const handleDelete = () => {
    mutate(categoryId);
  };

  return (
    <DeleteDialog
      title="Delete Category"
      description="This action cannot be undone. This will permanently delete the category and may affect all products using this category."
      warningMessage="Warning: This action cannot be undone. Are you sure you want to continue?"
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

