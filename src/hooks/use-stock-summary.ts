import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { stockSummaryServices } from "@/services/stock-summary-services";
import { QueryParams, PaginatedResponse } from "@/types";
import { IStockSummary } from "@/types/api";

// QUERY KEYS
export const stockSummaryKeys = {
  all: [{ scope: "STOCK_SUMMARY" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...stockSummaryKeys.all[0], entity: "list", queryParams }] as const,
  detail: (productId: number, queryParams?: QueryParams) =>
    [{ ...stockSummaryKeys.all[0], entity: "detail", productId, queryParams }] as const,
};

// QUERIES
export const useFetchStockSummary = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: stockSummaryKeys.list(queryOptions),
    queryFn: stockSummaryServices.fetchStockSummary,
    placeholderData: keepPreviousData,
  });

export const useFetchProductStockSummary = (productId: number, queryOptions?: QueryParams) =>
  useQuery({
    queryKey: stockSummaryKeys.detail(productId, queryOptions),
    queryFn: stockSummaryServices.fetchProductStockSummary,
    placeholderData: keepPreviousData,
    enabled: !!productId,
  });

