import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IStockOut, MutationResponse, PaginatedResponse, QueryParams } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { stockOutKeys } from "@/hooks/use-stock-out";
import { StockOutFormData } from "@/schemas/stock-out-schema";

export const stockOutServices = {
  fetchStockOutRecords: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof stockOutKeys)["list"]>>): Promise<
    PaginatedResponse<IStockOut>
  > => apiClient.get(generateEndPoint("stock-out", queryParams)),

  fetchStockOutById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof stockOutKeys)["detail"]>>): Promise<
    MutationResponse<IStockOut>
  > => apiClient.get(`stock-out/${id}`),

  addStockOut: (data: StockOutFormData): Promise<MutationResponse<IStockOut>> =>
    apiClient.post("stock-out", data),

  updateStockOut: ({
    id,
    data,
  }: {
    id: number;
    data: StockOutFormData;
  }): Promise<MutationResponse<IStockOut>> =>
    apiClient.put(`stock-out/${id}`, data),

  deleteStockOut: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`stock-out/${id}`),
};

