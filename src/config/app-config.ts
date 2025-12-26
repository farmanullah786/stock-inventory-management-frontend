// import { env } from "./env";

// export const appConfig = {
//   title: "Stock In & Out Inventory Management System",
//   description: "Inventory management system for stock tracking",
//   api: {
//     baseUrl: (env.VITE_APP_BASE_URL || "http://localhost:5000") + "/api",
//     timeout: 30000,
//   },
//   auth: {
//     tokenKey: "accessToken",
//     refreshTokenKey: "refresh-token",
//   },
//   pagination: {
//     defaultPageSize: 10,
//     maxPageSize: 100,
//   },
// } as const;

import { env } from "./env";

export const appConfig = {
  title: "Stock In & Out Inventory Management System",
  description: "Inventory management system for stock tracking",
  api: {
    baseUrl:
      import.meta.env.MODE === "development"
        ? (env.VITE_APP_BASE_URL || "http://localhost:5000") + "/api"
        : "/api",
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
