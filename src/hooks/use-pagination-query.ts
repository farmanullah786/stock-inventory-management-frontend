import { useSearchParams } from "react-router-dom";

export const usePaginationQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const materialIdParam = searchParams.get("materialId");
  
  const queryOptions = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    status: searchParams.get("status") || undefined,
    materialId: materialIdParam ? Number(materialIdParam) : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  return { searchParams, setSearchParams, queryOptions };
};

