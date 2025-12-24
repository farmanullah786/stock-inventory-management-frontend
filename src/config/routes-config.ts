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
    createPurchaseRequest: "/purchase-requests/create",
    editPurchaseRequest: "/purchase-requests/:id/edit",
    purchaseRequestDetail: "/purchase-requests/:id",
    goodsReceipts: "/goods-receipts",
    createGoodsReceipt: "/goods-receipts/create",
    editGoodsReceipt: "/goods-receipts/:id/edit",
    goodsReceiptDetail: "/goods-receipts/:id",
    categories: "/categories",
    products: "/products",
    stockSummary: "/stock-summary",
    users: "/users",
    settings: "/settings",
  },
} as const;

