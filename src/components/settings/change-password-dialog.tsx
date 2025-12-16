import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogBody,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormData } from "@/schemas/change-password-schema";
import { PasswordInput } from "../ui/password-input";
import { useAppStore } from "@/store/use-app-store";
import { useChangePassword } from "@/hooks/use-user";

export function ChangePasswordDialog() {
  const { setDialogType } = useAppStore();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useChangePassword();

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <DialogContent
      className="sm:max-w-md"
      onCloseAutoFocus={() => {
        form.reset();
        setDialogType("None");
      }}
    >
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-primary" />
          <DialogTitle>Change Password</DialogTitle>
        </div>
        <DialogDescription>
          Enter your current password and choose a new one.
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <Form {...form}>
          <form
            id="change-password-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <Button
          disabled={changePasswordMutation.isPending}
          form="change-password-form"
          type="submit"
        >
          {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

