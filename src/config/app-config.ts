const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const appConfig = {
  title: "Stock In & Out Inventory Management System",
  description: "Inventory management system for stock tracking",
  api: {
    baseUrl: API_BASE_URL,
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

