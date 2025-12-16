import axios, { AxiosInstance } from "axios";
import { appConfig } from "@/config/app-config";

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: appConfig.api.baseUrl,
    timeout: appConfig.api.timeout,
    // headers: {
    //   "Content-Type": "application/json",
    // },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(appConfig.auth.tokenKey);
      if (config.headers) {
        config.headers.Accept = "application/json";

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(appConfig.auth.tokenKey);
        localStorage.removeItem(appConfig.auth.refreshTokenKey);
        window.location.reload();
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      return Promise.reject({
        message,
      });
    }
  );

  return client;
};

export const apiClient = createApiClient();

export type ApiClientType = typeof apiClient;

