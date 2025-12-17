import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { stockSummaryServices } from "@/services/stock-summary-services";
import { QueryParams } from "@/types";

// QUERY KEYS
export const stockSummaryKeys = {
  all: [{ scope: "STOCK_SUMMARY" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...stockSummaryKeys.all[0], entity: "list", queryParams }] as const,
};

// QUERIES
export const useFetchStockSummary = (queryOptions?: QueryParams) =>
  useQuery({
    queryKey: stockSummaryKeys.list(queryOptions),
    queryFn: stockSummaryServices.fetchStockSummary,
    placeholderData: keepPreviousData,
  });

