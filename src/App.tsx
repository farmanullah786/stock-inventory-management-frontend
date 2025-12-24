import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { RootLayout } from "./layouts/root-layout";
import { AuthLayout } from "./layouts/auth-layout";
import { ProtectedRoute } from "./routes/protected-route";
import { PublicRoute } from "./routes/public-route";
import { routesConfig } from "./config/routes-config";
import { DEFAULT_THEME, THEME_STORAGE_KEY, QUERY_CONFIG } from "./constants";
import { getPathSegment } from "./lib/utils";
import Dashboard from "./pages/dashboard/dashboard";
import StockIn from "./pages/stock-in/stock-in.tsx";
import StockOut from "./pages/stock-out/stock-out.tsx";
import StockSummary from "./pages/stock-summary/stock-summary.tsx";
import CategoryManagement from "./pages/category-management/category-management.tsx";
import ProductManagement from "./pages/product-management/product-management.tsx";
import Settings from "./pages/settings/settings.tsx";
import Users from "./pages/users/users";
import PurchaseRequest from "./pages/purchase-request/purchase-request";
import CreatePurchaseRequest from "./pages/purchase-request/create-purchase-request";
import EditPurchaseRequest from "./pages/purchase-request/edit-purchase-request";
import PurchaseRequestDetail from "./pages/purchase-request/purchase-request-detail";
import GoodsReceipt from "./pages/goods-receipt/goods-receipt";
import CreateGoodsReceipt from "./pages/goods-receipt/create-goods-receipt";
import EditGoodsReceipt from "./pages/goods-receipt/edit-goods-receipt";
import GoodsReceiptDetail from "./pages/goods-receipt/goods-receipt-detail";
import CreateStockIn from "./pages/stock-in/create-stock-in";
import StockInDetail from "./pages/stock-in/stock-in-detail";
import CreateStockOut from "./pages/stock-out/create-stock-out";
import StockOutDetail from "./pages/stock-out/stock-out-detail";
import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      toast.error(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(error.message);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      retry: QUERY_CONFIG.RETRY,
    },
  },
});

const router = createBrowserRouter([
  {
    path: routesConfig.home,
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: getPathSegment(routesConfig.app.stockIn),
        element: <StockIn />,
      },
      {
        path: getPathSegment(routesConfig.app.createStockIn),
        element: <CreateStockIn />,
      },
      {
        path: getPathSegment(routesConfig.app.stockInDetail),
        element: <StockInDetail />,
      },
      {
        path: getPathSegment(routesConfig.app.stockOut),
        element: <StockOut />,
      },
      {
        path: getPathSegment(routesConfig.app.createStockOut),
        element: <CreateStockOut />,
      },
      {
        path: getPathSegment(routesConfig.app.stockOutDetail),
        element: <StockOutDetail />,
      },
      {
        path: getPathSegment(routesConfig.app.purchaseRequests),
        element: <PurchaseRequest />,
      },
      {
        path: getPathSegment(routesConfig.app.createPurchaseRequest),
        element: <CreatePurchaseRequest />,
      },
      {
        path: getPathSegment(routesConfig.app.editPurchaseRequest),
        element: <EditPurchaseRequest />,
      },
      {
        path: getPathSegment(routesConfig.app.purchaseRequestDetail),
        element: <PurchaseRequestDetail />,
      },
      {
        path: getPathSegment(routesConfig.app.goodsReceipts),
        element: <GoodsReceipt />,
      },
      {
        path: getPathSegment(routesConfig.app.createGoodsReceipt),
        element: <CreateGoodsReceipt />,
      },
      {
        path: getPathSegment(routesConfig.app.editGoodsReceipt),
        element: <EditGoodsReceipt />,
      },
      {
        path: getPathSegment(routesConfig.app.goodsReceiptDetail),
        element: <GoodsReceiptDetail />,
      },
      {
        path: getPathSegment(routesConfig.app.categories),
        element: <CategoryManagement />,
      },
      {
        path: getPathSegment(routesConfig.app.products),
        element: <ProductManagement />,
      },
      {
        path: getPathSegment(routesConfig.app.stockSummary),
        element: <StockSummary />,
      },
      {
        path: getPathSegment(routesConfig.app.users),
        element: <Users />,
      },
      {
        path: getPathSegment(routesConfig.app.settings),
        element: <Settings />,
      },
    ],
  },
  {
    path: getPathSegment(routesConfig.auth.base),
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={routesConfig.auth.login} replace />,
      },
      {
        path: getPathSegment(routesConfig.auth.login, routesConfig.auth.base),
        element: <Login />,
      },
      {
        path: getPathSegment(routesConfig.auth.requestPasswordReset, routesConfig.auth.base),
        element: <ForgotPassword />,
      },
      {
        path: getPathSegment(routesConfig.auth.resetPassword, routesConfig.auth.base),
        element: <ResetPassword />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme={DEFAULT_THEME} storageKey={THEME_STORAGE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
