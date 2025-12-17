import { useSearchParams } from "react-router-dom";
import { QueryParams } from "@/types";

export const usePaginationQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryOptions: QueryParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined,
    productId: searchParams.get("productId")
      ? Number(searchParams.get("productId"))
      : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    isActive: searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined,
    role: searchParams.get("role") || undefined,
    status: searchParams.get("status") || undefined,
  };

  return { searchParams, setSearchParams, queryOptions };
};

