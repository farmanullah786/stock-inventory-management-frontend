import { apiClient } from "./api-client";
import { generateEndPoint } from "@/lib/utils";
import { IProduct, MutationResponse, PaginatedResponse, QueryParams } from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { productKeys } from "@/hooks/use-products";
import { ProductFormData } from "@/schemas/product-schema";

export const productServices = {
  fetchProducts: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof productKeys)["list"]>>): Promise<
    PaginatedResponse<IProduct>
  > => apiClient.get(generateEndPoint("products", queryParams)),

  fetchProductById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof productKeys)["detail"]>>): Promise<
    MutationResponse<IProduct>
  > => apiClient.get(`products/${id}`),

  addProduct: (data: ProductFormData): Promise<MutationResponse<IProduct>> =>
    apiClient.post("products", data),

  updateProduct: ({
    id,
    data,
  }: {
    id: number;
    data: ProductFormData;
  }): Promise<MutationResponse<IProduct>> =>
    apiClient.put(`products/${id}`, data),

  deleteProduct: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`products/${id}`),
};

