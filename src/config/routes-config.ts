export const routesConfig = {
  home: "/",
  auth: {
    login: "/auth/login",
    requestPasswordReset: "/auth/request-password-reset",
    resetPassword: "/auth/reset-password/:resetToken",
  },
      app: {
        dashboard: "/",
        stockIn: "/stock-in",
        stockOut: "/stock-out",
        categories: "/categories",
        products: "/products",
        stockSummary: "/stock-summary",
        users: "/users",
        settings: "/settings",
      },
} as const;

