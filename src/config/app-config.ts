import { env } from "./env";

export const appConfig = {
  title: "Stock In & Out Inventory Management System",
  description: "Inventory management system for stock tracking",
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeout: 30000,
  },
  auth: {
    tokenKey: "accessToken",
    refreshTokenKey: "refresh-token",
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
} as const;

