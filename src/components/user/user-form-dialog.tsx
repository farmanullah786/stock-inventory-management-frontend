import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  baseSchema,
  CreateUserFormData,
  createUserSchema,
  UpdateUserFormData,
} from "@/schemas/user-form-schema";
import { useAddUser, useUpdateUser } from "@/hooks/use-user";
import { capitalizeWords } from "@/lib/utils";
import { PasswordInput } from "../ui/password-input";

const content = {
  create: {
    title: "Add New User",
    description: "Add a new user by filling out the required details below.",
    btnTitle: "Create User",
  },
  update: {
    title: "Update User",
    description: "Modify user details as needed and save your changes.",
    btnTitle: "Save Changes",
  },
};

const defaultValues = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  role: "viewer" as const,
  status: "active" as const,
  password: "",
  confirmPassword: "",
};

type UserFormProps =
  | { action: "create" }
  | {
      action: "update";
      user: UpdateUserFormData;
      userId: number;
    };

export function UserForm(props: UserFormProps) {
  const { action } = props;

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(action === "create" ? createUserSchema : baseSchema),
    defaultValues: defaultValues,
    values: action === "update" ? props.user : undefined,
  });

  const addMutation = useAddUser();
  const updateMutation = useUpdateUser();

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    if (action === "update") {
      updateMutation.mutate({ id: props.userId, data });
      return;
    }
    addMutation.mutate(data as CreateUserFormData);
  };

  const { title, description, btnTitle } = content[action];

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="max-w-md" onCloseAutoFocus={() => form.reset()}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Email */}
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

            {/* Contact */}
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

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["admin", "stock_manager", "stock_keeper", "viewer"].map(
                        (role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="capitalize"
                          >
                            {capitalizeWords(role)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["active", "inactive"].map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="capitalize"
                        >
                          {capitalizeWords(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {action === "create" && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="******" {...field} />
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <Button disabled={isPending} form="user-form">
          {btnTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
