import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormData } from "@/schemas/category-schema";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddCategory, useUpdateCategory } from "@/hooks/use-categories";

const defaultValues = {
  name: "",
  description: "",
  isActive: true,
};

type CategoryFormProps =
  | { action: "create" }
  | {
      action: "update";
      category: CategoryFormData;
      categoryId: number;
    };

export function CategoryFormDialog(props: CategoryFormProps) {
  const { action } = props;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
    values: action === "update" ? props.category : undefined,
  });

  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();

  const onSubmit = async (data: CategoryFormData) => {
    if (action === "update") {
      updateMutation.mutate({ 
        id: props.categoryId, 
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        }
      });
      return;
    }
    addMutation.mutate(data);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const title = action === "update" ? "Edit Category" : "Add New Category";
  const description =
    action === "update"
      ? "Modify category details as needed and save your changes."
      : "Add a new category by filling out the required details below.";
  const btnTitle = action === "update" ? "Save Changes" : "Create Category";

  return (
    <DialogContent
      className="max-w-md"
      onCloseAutoFocus={() => form.reset()}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <Form {...form}>
          <form
            id="category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details"
                      rows="3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <Button disabled={isPending} form="category-form" type="submit">
          {isPending ? "Saving..." : btnTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default CategoryFormDialog;

