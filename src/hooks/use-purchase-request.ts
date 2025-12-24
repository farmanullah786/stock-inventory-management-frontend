import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { closeDialog } from "@/components/ui/dialog";
import { purchaseRequestServices } from "@/services/purchase-request-services";
import { QueryParams, MutationResponse } from "@/types";
import { IPurchaseRequest } from "@/types/api";

// QUERY KEYS
export const purchaseRequestKeys = {
  all: [{ scope: "PURCHASE_REQUEST" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...purchaseRequestKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...purchaseRequestKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchPurchaseRequests = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: purchaseRequestKeys.list(queryOptions),
    queryFn: purchaseRequestServices.fetchPurchaseRequests,
    placeholderData: keepPreviousData,
  });

export const useFetchPurchaseRequest = (id: number) =>
  useQuery({
    queryKey: purchaseRequestKeys.detail(id),
    queryFn: purchaseRequestServices.fetchPurchaseRequestById,
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: !!id,
  });

// MUTATIONS
export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: purchaseRequestServices.addPurchaseRequest,
    onSuccess: (data: MutationResponse<IPurchaseRequest>) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
      navigate("/purchase-requests");
    },
  });
};

export const useUpdatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: purchaseRequestServices.updatePurchaseRequest,
    onSuccess: (data: MutationResponse<IPurchaseRequest>) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
      navigate("/purchase-requests");
    },
  });
};

export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestServices.deletePurchaseRequest,
    onSuccess: (data: MutationResponse) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
    },
  });
};

export const useSubmitPurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestServices.submitPurchaseRequest,
    onSuccess: (data: MutationResponse<IPurchaseRequest>) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useApprovePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestServices.approvePurchaseRequest,
    onSuccess: (data: MutationResponse<IPurchaseRequest>) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useRejectPurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestServices.rejectPurchaseRequest,
    onSuccess: (data: MutationResponse<IPurchaseRequest>) => {
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

