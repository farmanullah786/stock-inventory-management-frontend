import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IStockIn, MutationResponse, PaginatedResponse } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { stockInKeys } from "@/hooks/use-stock-in";
import { StockInFormData } from "@/schemas/stock-in-schema";

export const stockInServices = {
  fetchStockInRecords: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof stockInKeys)["list"]>>): Promise<
    PaginatedResponse<IStockIn>
  > => apiClient.get(generateEndPoint("stock-in", queryParams)),

  fetchStockInById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof stockInKeys)["detail"]>>): Promise<
    MutationResponse<IStockIn>
  > => apiClient.get(`stock-in/${id}`),

  addStockIn: (data: StockInFormData): Promise<MutationResponse<IStockIn>> =>
    apiClient.post("stock-in", data),

  updateStockIn: ({
    id,
    data,
  }: {
    id: number;
    data: StockInFormData;
  }): Promise<MutationResponse<IStockIn>> =>
    apiClient.put(`stock-in/${id}`, data),

  deleteStockIn: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`stock-in/${id}`),
};

