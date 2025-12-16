import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  closeSheet,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { profileSchema, type ProfileFormData } from "@/schemas/profile-schema";
import { IUser } from "@/types/api";
import { useUser } from "@/store/use-user-store";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "@/components/ui/sonner";

export function ProfileSheet({ user }: { user: IUser }) {
  const { updateUser } = useUser();
  const { setDialogType } = useAppStore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      imageUrl: user.imageUrl || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update user in store
      updateUser({
        ...data,
        fullName: `${data.firstName} ${data.lastName || ""}`.trim(),
      });
      toast.success("Profile updated successfully");
      setDialogType("None");
      closeSheet();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px]"
      onCloseAutoFocus={() => {
        form.reset();
        setDialogType("None");
      }}
    >
      <SheetHeader>
        <SheetTitle>Update Profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile information here.
        </SheetDescription>
      </SheetHeader>

      <div className="py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., john@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="+92 123 456 78 90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <SheetClose>Close</SheetClose>
              <Button disabled={isPending} type="submit">
                {isPending ? "Updating..." : "Update Profile"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </div>
    </SheetContent>
  );
}

