import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthCard from "./auth-card";
import { Mail } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/schemas/auth-schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRequestPasswordReset } from "@/hooks/use-auth";

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestPasswordResetMutation = useRequestPasswordReset();

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestPasswordResetMutation.mutate(data, {
      onSuccess() {
        form.reset();
      },
    });
  };

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email and we will send you a link to reset your password."
      icon={<Mail className="w-8 h-8 text-primary" />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={requestPasswordResetMutation.isPending}
          >
            Send Email
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              Remember your password?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};

