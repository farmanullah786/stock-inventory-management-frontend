import { z } from "zod";

const ROLES = ["admin", "stock_manager", "stock_keeper", "viewer"] as const;
const STATUS_OPTIONS = ["active", "inactive"] as const;

export const baseSchema = z.object({
  imageUrl: z.string().optional(),
  firstName: z.string().min(1, { message: "First Name is required." }),
  lastName: z.string().min(1, { message: "Last Name is required." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional(),
  role: z.enum(ROLES, {
    required_error: "Please select a role",
  }),
  status: z.enum(STATUS_OPTIONS, {
    required_error: "Please select a status",
  }),
});

export const createUserSchema = baseSchema
  .extend({
    password: z
      .string({ message: "password is required." })
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string({ message: "Confirm password is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof baseSchema>;

