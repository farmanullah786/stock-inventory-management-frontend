export const routesConfig = {
  home: "/",
  auth: {
    base: "/auth",
    login: "/auth/login",
    requestPasswordReset: "/auth/request-password-reset",
    resetPassword: "/auth/reset-password/:resetToken",
  },
  app: {
    dashboard: "/",
    stockIn: "/stock-in",
    stockOut: "/stock-out",
    purchaseRequests: "/purchase-requests",
    goodsReceipts: "/goods-receipts",
    categories: "/categories",
    products: "/products",
    stockSummary: "/stock-summary",
    users: "/users",
    settings: "/settings",
  },
} as const;

