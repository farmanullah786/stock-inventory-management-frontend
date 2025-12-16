import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import PasswordResetForm from "@/components/auth/password-reset-form";
import Loader from "@/components/ui/loader";
import { routesConfig } from "@/config/routes-config";
import { useValidateResetToken } from "@/hooks/use-auth";

export default function ResetPassword() {
  const { resetToken } = useParams() as { resetToken: string };

  const {
    data: tokenValidation,
    isLoading: isValidating,
    isError,
    error,
  } = useValidateResetToken(resetToken);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-white/50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader className="size-8 -my-8" isPending={true} />
            <h2 className="text-xl font-semibold mb-2 -mt-4">
              Validating Reset Link
            </h2>
            <p className="text-muted-foreground text-center">
              Please wait while we validate your password reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resetToken || isError || !tokenValidation?.data?.isValid) {
    let errorMessage =
      error?.message || "This password reset link is invalid or has expired.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-white/50">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Link to={routesConfig.auth.requestPasswordReset}>
              <Button>Request New Reset Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PasswordResetForm />;
}

