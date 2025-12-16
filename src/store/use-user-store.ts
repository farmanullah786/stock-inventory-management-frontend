import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/types/api";
import { QueryClient } from "@tanstack/react-query";
import { appConfig } from "@/config/app-config";

interface UserStore {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  updateUser: (userData: Partial<IUser>) => void;
  login: (user: IUser, accessToken: string) => void;
  logout: (queryClient?: QueryClient) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      login: (user: IUser, accessToken: string) => {
        localStorage.setItem(appConfig.auth.tokenKey, accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: async (queryClient?: QueryClient) => {
        // Clear React Query cache
        if (queryClient) {
          queryClient.clear();
        }
        // Remove token from localStorage
        localStorage.removeItem(appConfig.auth.tokenKey);
        localStorage.removeItem(appConfig.auth.refreshTokenKey);
        // Clear user and token from store
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export const useUser = () => {
  const store = useUserStore();
  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    setUser: store.setUser,
    updateUser: store.updateUser,
    login: store.login,
    logout: store.logout,
  };
};

