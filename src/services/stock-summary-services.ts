import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IStockSummary, PaginatedResponse } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { stockSummaryKeys } from "@/hooks/use-stock-summary";

export const stockSummaryServices = {
  fetchStockSummary: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof stockSummaryKeys)["list"]>>): Promise<
    PaginatedResponse<IStockSummary>
  > => apiClient.get(generateEndPoint("stock-summary", queryParams)),
};

