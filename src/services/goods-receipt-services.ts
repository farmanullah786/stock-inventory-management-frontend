import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IGoodsReceipt, MutationResponse, PaginatedResponse } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { goodsReceiptKeys } from "@/hooks/use-goods-receipt";
import { GoodsReceiptFormData } from "@/schemas/goods-receipt-schema";

export const goodsReceiptServices = {
  fetchGoodsReceipts: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof goodsReceiptKeys)["list"]>>): Promise<
    PaginatedResponse<IGoodsReceipt>
  > => apiClient.get(generateEndPoint("goods-receipts", queryParams)),

  fetchGoodsReceiptById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof goodsReceiptKeys)["detail"]>>): Promise<
    MutationResponse<IGoodsReceipt>
  > => apiClient.get(`goods-receipts/${id}`),

  fetchGoodsReceiptByGrn: (grnNumber: string): Promise<MutationResponse<IGoodsReceipt>> =>
    apiClient.get(`goods-receipts/by-grn/${grnNumber}`),

  addGoodsReceipt: (data: GoodsReceiptFormData): Promise<MutationResponse<IGoodsReceipt>> =>
    apiClient.post("goods-receipts", data),

  updateGoodsReceipt: ({
    id,
    data,
  }: {
    id: number;
    data: GoodsReceiptFormData;
  }): Promise<MutationResponse<IGoodsReceipt>> =>
    apiClient.put(`goods-receipts/${id}`, data),

  deleteGoodsReceipt: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`goods-receipts/${id}`),

  verifyGoodsReceipt: (id: number): Promise<MutationResponse<IGoodsReceipt>> =>
    apiClient.post(`goods-receipts/${id}/verify`),
};

