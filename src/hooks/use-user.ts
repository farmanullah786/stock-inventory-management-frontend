import { QueryParams } from "@/types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { userServices } from "@/services/user-services";
import { useStore } from "@/store/use-app-store";
import { useUser } from "@/store/use-user-store";
import { closeDialog } from "@/components/ui/dialog";

// QUERY KEYS
export const userKeys = {
  all: [{ scope: "USERS" }] as const,
  list: (queryParams?: QueryParams) =>
    [{ ...userKeys.all[0], entity: "list", queryParams }] as const,
  detail: (id: number) =>
    [{ ...userKeys.all[0], entity: "detail", id }] as const,
};

// QUERIES
export const useFetchUsers = (queryOptions: QueryParams) =>
  useQuery({
    queryKey: userKeys.list(queryOptions),
    queryFn: userServices.fetchUsers,
    placeholderData: keepPreviousData,
  });

export const useFetchUserById = (id: number) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: userServices.fetchUserById,
    enabled: !!id,
  });

// MUTATIONS
export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userServices.addUser,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useUpdateUser = () => {
  const { user: currentUser, updateUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userServices.updateUser,
    onSuccess(data) {
      // Check if the updated user is the currently logged-in user
      if (currentUser && data.data && data.data.id === currentUser.id) {
        // Update the current user's data in localStorage
        updateUser(data.data);
      }

      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
      toast.success(data.message);
      closeDialog();
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userServices.deleteUser,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
      toast.success(data.message);
    },
  });
};

// AUTHENTICATED USER MUTATIONS
export const useChangePassword = () => {
  const { setDialogType } = useStore();

  return useMutation({
    mutationFn: userServices.changePassword,
    onSuccess(data) {
      toast.success(data.message);
      setDialogType("None");
    },
  });
};

