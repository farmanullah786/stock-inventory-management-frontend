import { Navigate } from "react-router-dom";
import { useUser } from "@/store/use-user-store";
import { routesConfig } from "@/config/routes-config";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return <Navigate to={routesConfig.app.dashboard} replace />;
  }

  return <>{children}</>;
}

