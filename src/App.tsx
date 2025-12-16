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
import Dashboard from "./pages/dashboard/dashboard";
import StockIn from "./pages/stock-in/stock-in.tsx";
import StockOut from "./pages/stock-out/stock-out.tsx";
import StockSummary from "./pages/stock-summary/stock-summary.tsx";
import CategoryManagement from "./pages/category-management/category-management.tsx";
import ProductManagement from "./pages/product-management/product-management.tsx";
import Settings from "./pages/settings/settings.tsx";
import Users from "./pages/users/users";
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
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
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
        path: "stock-in",
        element: <StockIn />,
      },
      {
        path: "stock-out",
        element: <StockOut />,
      },
      {
        path: "categories",
        element: <CategoryManagement />,
      },
      {
        path: "products",
        element: <ProductManagement />,
      },
      {
        path: "stock-summary",
        element: <StockSummary />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/auth",
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
        path: "login",
        element: <Login />,
      },
      {
        path: "request-password-reset",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password/:resetToken",
        element: <ResetPassword />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="odoo-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
