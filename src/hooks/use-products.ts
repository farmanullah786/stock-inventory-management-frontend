import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { closeDialog } from "@/components/ui/dialog";
import { productServices } from "@/services/product-services";
import { QueryParams, MutationResponse, PaginatedResponse } from "@/types";
import { IProduct } from "@/types/api";
import { ProductFormData } from "@/schemas/product-schema";

// QUERY KEYS
export const productKeys = {
  all: [{ scope: "PRODUCTS" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...productKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...productKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchProducts = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: productKeys.list(queryOptions),
    queryFn: productServices.fetchProducts,
    placeholderData: keepPreviousData,
  });

export const useFetchProduct = (id: number) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: productServices.fetchProductById,
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: !!id,
  });

// MUTATIONS
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productServices.addProduct,
    onSuccess: (data: MutationResponse<IProduct>) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message || "Product created successfully");
      closeDialog();
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productServices.updateProduct,
    onSuccess: (data: MutationResponse<IProduct>) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message || "Product updated successfully");
      closeDialog();
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productServices.deleteProduct,
    onSuccess: (data: MutationResponse) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message || "Product deleted successfully");
    },
  });
};

