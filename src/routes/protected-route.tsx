import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/store/use-user-store";
import { routesConfig } from "@/config/routes-config";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActiveStatus?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireActiveStatus = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, logout } = useUser();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={routesConfig.auth.login} replace />;
  }

  // Check if user exists
  if (!user) {
    return <Navigate to={routesConfig.auth.login} replace />;
  }

  // Check active status if required
  if (requireActiveStatus && user.status !== "active") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Account Inactive</h2>
          <p className="mt-2 text-muted-foreground">
            Your account is currently inactive. Please contact an administrator.
          </p>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="mt-4 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

