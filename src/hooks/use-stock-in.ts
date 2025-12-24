import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { stockInServices } from "@/services/stock-in-services";
import { QueryParams, MutationResponse } from "@/types";
import { IStockIn } from "@/types/api";

// QUERY KEYS
export const stockInKeys = {
  all: [{ scope: "STOCK_IN" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...stockInKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...stockInKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchStockInRecords = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: stockInKeys.list(queryOptions),
    queryFn: stockInServices.fetchStockInRecords,
    placeholderData: keepPreviousData,
  });

export const useFetchStockIn = (id: number) =>
  useQuery({
    queryKey: stockInKeys.detail(id),
    queryFn: stockInServices.fetchStockInById,
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: !!id,
  });

// MUTATIONS
export const useAddStockIn = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: stockInServices.addStockIn,
    onSuccess: (data: MutationResponse<IStockIn>) => {
      queryClient.invalidateQueries({
        queryKey: stockInKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
      navigate("/stock-in");
    },
  });
};

export const useUpdateStockIn = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: stockInServices.updateStockIn,
    onSuccess: (data: MutationResponse<IStockIn>) => {
      queryClient.invalidateQueries({
        queryKey: stockInKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
      navigate("/stock-in");
    },
  });
};

export const useDeleteStockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stockInServices.deleteStockIn,
    onSuccess: (data: MutationResponse) => {
      queryClient.invalidateQueries({
        queryKey: stockInKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
    },
  });
};


