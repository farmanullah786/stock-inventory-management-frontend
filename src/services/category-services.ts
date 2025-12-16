import { MutationResponse, PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";
import { ICategory } from "@/types/api";
import { CategoryFormData } from "@/schemas/category-schema";
import { QueryFunctionContext } from "@tanstack/react-query";
import { categoryKeys } from "@/hooks/use-categories";
import { generateEndPoint } from "@/lib/utils";

export const categoryServices = {
  fetchCategories: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof categoryKeys)["list"]>>): Promise<
    PaginatedResponse<ICategory>
  > => apiClient.get(generateEndPoint("categories", queryParams)),

  fetchCategoryById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof categoryKeys)["detail"]>>): Promise<
    MutationResponse<ICategory>
  > => apiClient.get(`categories/${id}`),

  addCategory: (
    data: CategoryFormData
  ): Promise<MutationResponse<ICategory>> => apiClient.post("categories", data),

  deleteCategory: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`categories/${id}`),

  updateCategory: ({
    id,
    data,
  }: {
    id: number;
    data: Partial<CategoryFormData>;
  }): Promise<MutationResponse<ICategory>> =>
    apiClient.put(`categories/${id}`, data),
};

