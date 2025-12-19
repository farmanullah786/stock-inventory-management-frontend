import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IPurchaseRequest, MutationResponse, PaginatedResponse } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { purchaseRequestKeys } from "@/hooks/use-purchase-request";
import { PurchaseRequestFormData } from "@/schemas/purchase-request-schema";

export const purchaseRequestServices = {
  fetchPurchaseRequests: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof purchaseRequestKeys)["list"]>>): Promise<
    PaginatedResponse<IPurchaseRequest>
  > => apiClient.get(generateEndPoint("purchase-requests", queryParams)),

  fetchPurchaseRequestById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof purchaseRequestKeys)["detail"]>>): Promise<
    MutationResponse<IPurchaseRequest>
  > => apiClient.get(`purchase-requests/${id}`),

  addPurchaseRequest: (data: PurchaseRequestFormData): Promise<MutationResponse<IPurchaseRequest>> =>
    apiClient.post("purchase-requests", data),

  updatePurchaseRequest: ({
    id,
    data,
  }: {
    id: number;
    data: PurchaseRequestFormData;
  }): Promise<MutationResponse<IPurchaseRequest>> =>
    apiClient.put(`purchase-requests/${id}`, data),

  deletePurchaseRequest: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`purchase-requests/${id}`),

  submitPurchaseRequest: (id: number): Promise<MutationResponse<IPurchaseRequest>> =>
    apiClient.post(`purchase-requests/${id}/submit`),

  approvePurchaseRequest: (id: number): Promise<MutationResponse<IPurchaseRequest>> =>
    apiClient.post(`purchase-requests/${id}/approve`),

  rejectPurchaseRequest: ({
    id,
    rejectionReason,
  }: {
    id: number;
    rejectionReason: string;
  }): Promise<MutationResponse<IPurchaseRequest>> =>
    apiClient.post(`purchase-requests/${id}/reject`, { rejectionReason }),
};

