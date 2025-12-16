import { MutationResponse } from "@/types";
import { apiClient } from "./api-client";
import { IUser } from "@/types/api";
import {
  ForgotPasswordFormData,
  LoginFormData,
  ResetPasswordFormData,
} from "@/schemas/auth-schemas";

export type AuthResponse = {
  user: IUser;
  userId: number;
  accessToken: string;
};

export const authServices = {
  login: (data: LoginFormData): Promise<MutationResponse<AuthResponse>> =>
    apiClient.post("/auth/login", data),

  logout: (): Promise<MutationResponse> => apiClient.post("/auth/logout"),

  requestPasswordReset: (
    data: ForgotPasswordFormData
  ): Promise<MutationResponse> =>
    apiClient.put("/auth/request-password-reset", data),

  validateResetToken: (
    resetToken: string
  ): Promise<MutationResponse<{ isValid: boolean; expiresAt: number }>> =>
    apiClient.get(`/auth/validate-reset-token/${resetToken}`),

  resetPassword: (data: {
    resetToken: string;
    resetPasswordData: ResetPasswordFormData;
  }): Promise<MutationResponse> =>
    apiClient.put(
      `/auth/reset-password/${data.resetToken}`,
      data.resetPasswordData
    ),
};

