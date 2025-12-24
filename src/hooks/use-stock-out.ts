import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { closeDialog } from "@/components/ui/dialog";
import { stockOutServices } from "@/services/stock-out-services";
import { QueryParams, MutationResponse } from "@/types";
import { IStockOut } from "@/types/api";
import { routesConfig } from "@/config/routes-config";

// QUERY KEYS
export const stockOutKeys = {
  all: [{ scope: "STOCK_OUT" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...stockOutKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...stockOutKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchStockOutRecords = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: stockOutKeys.list(queryOptions),
    queryFn: stockOutServices.fetchStockOutRecords,
    placeholderData: keepPreviousData,
  });

export const useFetchStockOut = (id: number) =>
  useQuery({
    queryKey: stockOutKeys.detail(id),
    queryFn: stockOutServices.fetchStockOutById,
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: !!id,
  });

// MUTATIONS
export const useAddStockOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: stockOutServices.addStockOut,
    onSuccess: (data: MutationResponse<IStockOut>) => {
      queryClient.invalidateQueries({
        queryKey: stockOutKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
      navigate(routesConfig.app.stockOut);
    },
  });
};

export const useUpdateStockOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: stockOutServices.updateStockOut,
    onSuccess: (data: MutationResponse<IStockOut>) => {
      queryClient.invalidateQueries({
        queryKey: stockOutKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
      navigate(routesConfig.app.stockOut);
    },
  });
};

export const useDeleteStockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stockOutServices.deleteStockOut,
    onSuccess: (data: MutationResponse) => {
      queryClient.invalidateQueries({
        queryKey: stockOutKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
    },
  });
};

export const useValidateStockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stockOutServices.validateStockOut,
    onSuccess: (data: MutationResponse<IStockOut>) => {
      queryClient.invalidateQueries({
        queryKey: stockOutKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

