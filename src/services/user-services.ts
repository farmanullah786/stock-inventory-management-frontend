import { MutationResponse, PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";
import { IUser } from "@/types/api";
import { ChangePasswordFormData } from "@/schemas/change-password-schema";
import {
  CreateUserFormData,
  UpdateUserFormData,
} from "@/schemas/user-form-schema";
import { QueryFunctionContext } from "@tanstack/react-query";
import { userKeys } from "@/hooks/use-user";
import { generateEndPoint } from "@/lib/utils";

export const userServices = {
  // User Management
  fetchUsers: ({
    queryKey: [{ queryParams }],
  }: QueryFunctionContext<ReturnType<(typeof userKeys)["list"]>>): Promise<
    PaginatedResponse<IUser>
  > => apiClient.get(generateEndPoint("users", queryParams)),

  fetchUserById: ({
    queryKey: [{ id }],
  }: QueryFunctionContext<ReturnType<(typeof userKeys)["detail"]>>): Promise<
    MutationResponse<IUser>
  > => apiClient.get(`users/${id}`),

  addUser: (
    data: CreateUserFormData
  ): Promise<MutationResponse<IUser>> => apiClient.post("users", data),

  deleteUser: (id: number): Promise<MutationResponse> =>
    apiClient.delete(`users/${id}`),

  updateUser: ({
    id,
    data,
  }: {
    id: number;
    data: UpdateUserFormData;
  }): Promise<MutationResponse<IUser>> =>
    apiClient.put(`users/${id}`, data),

  // Authenticated User
  changePassword: (data: ChangePasswordFormData): Promise<MutationResponse> =>
    apiClient.put("users/me/change-password", data),
};

