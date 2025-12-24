import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { goodsReceiptServices } from "@/services/goods-receipt-services";
import { QueryParams, MutationResponse } from "@/types";
import { IGoodsReceipt } from "@/types/api";
import { routesConfig } from "@/config/routes-config";

// QUERY KEYS
export const goodsReceiptKeys = {
  all: [{ scope: "GOODS_RECEIPT" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...goodsReceiptKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...goodsReceiptKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchGoodsReceipts = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: goodsReceiptKeys.list(queryOptions),
    queryFn: goodsReceiptServices.fetchGoodsReceipts,
    placeholderData: keepPreviousData,
  });

export const useFetchGoodsReceipt = (id: number) =>
  useQuery({
    queryKey: goodsReceiptKeys.detail(id),
    queryFn: goodsReceiptServices.fetchGoodsReceiptById,
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: !!id,
  });

export const useFetchGoodsReceiptByGrn = (grnNumber: string, enabled: boolean = true) =>
  useQuery({
    queryKey: [{ scope: "GOODS_RECEIPT", entity: "byGrn", grnNumber }],
    queryFn: () => goodsReceiptServices.fetchGoodsReceiptByGrn(grnNumber),
    select: (data) => data.data,
    enabled: enabled && !!grnNumber && grnNumber.trim().length > 0,
  });

// MUTATIONS
export const useCreateGoodsReceipt = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: goodsReceiptServices.addGoodsReceipt,
    onSuccess: (data: MutationResponse<IGoodsReceipt>) => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_IN" }],
      });
      toast.success(data.message);
      navigate(routesConfig.app.goodsReceipts);
    },
  });
};

export const useUpdateGoodsReceipt = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: goodsReceiptServices.updateGoodsReceipt,
    onSuccess: (data: MutationResponse<IGoodsReceipt>) => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_IN" }],
      });
      toast.success(data.message);
      navigate(routesConfig.app.goodsReceipts);
    },
  });
};

export const useDeleteGoodsReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goodsReceiptServices.deleteGoodsReceipt,
    onSuccess: (data: MutationResponse) => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_IN" }],
      });
      toast.success(data.message);
    },
  });
};

export const useVerifyGoodsReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goodsReceiptServices.verifyGoodsReceipt,
    onSuccess: (data: MutationResponse<IGoodsReceipt>) => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_IN" }],
      });
      queryClient.invalidateQueries({
        queryKey: [{ scope: "STOCK_SUMMARY" }],
      });
      toast.success(data.message);
    },
  });
};

