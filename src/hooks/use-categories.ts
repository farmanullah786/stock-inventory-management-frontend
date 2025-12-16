import { QueryParams } from "@/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryServices } from "@/services/category-services";
import { closeDialog } from "@/components/ui/dialog";

// QUERY KEYS
export const categoryKeys = {
  all: [{ scope: "CATEGORIES" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...categoryKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...categoryKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchCategories = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: categoryKeys.list(queryOptions),
    queryFn: categoryServices.fetchCategories,
  });

export const useFetchCategoryById = (id: number) =>
  useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: categoryServices.fetchCategoryById,
    enabled: !!id,
  });

// MUTATIONS
export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryServices.addCategory,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryServices.updateCategory,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryServices.deleteCategory,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
      toast.success(data.message);
    },
  });
};

