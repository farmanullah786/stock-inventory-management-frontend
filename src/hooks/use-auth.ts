import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authServices } from "@/services/auth-services";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/store/use-user-store";
import { routesConfig } from "@/config/routes-config";

// QUERY KEYS
export const authKeys = {
  all: [{ scope: "AUTH" }] as const,
  validateResetToken: (resetToken: string) =>
    [{ ...authKeys.all[0], entity: "validate-reset-token", resetToken }] as const,
};

// QUERIES
export const useValidateResetToken = (resetToken: string | null) =>
  useQuery({
    queryKey: authKeys.validateResetToken(resetToken || ""),
    queryFn: () => authServices.validateResetToken(resetToken!),
    enabled: !!resetToken,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

// MUTATIONS
export const useLogin = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authServices.login,
    onSuccess(data) {
      login(data.data.user, data.data.accessToken);
      toast.success(data.message);
      navigate(routesConfig.app.dashboard);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: authServices.requestPasswordReset,
    onSuccess(data) {
      toast.success(data.message);
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authServices.resetPassword,
    onSuccess(data) {
      toast.success(data.message);
      navigate(routesConfig.auth.login);
    },
  });
};

export const useLogout = () => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authServices.logout,
    onSuccess(data) {
      logout(queryClient);
      toast.success(data.message);
      navigate(routesConfig.auth.login);
    },
  });
};

