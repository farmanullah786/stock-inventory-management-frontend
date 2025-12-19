import { z } from "zod";
import { ROLES, GENERAL_STATUS } from "@/constants";

const ROLE_ARRAY = [ROLES.ADMIN, ROLES.STOCK_MANAGER, ROLES.STOCK_KEEPER, ROLES.VIEWER] as const;
const STATUS_OPTIONS = [GENERAL_STATUS.ACTIVE, GENERAL_STATUS.INACTIVE] as const;

export const baseSchema = z.object({
  imageUrl: z.string().optional(),
  firstName: z.string().min(1, { message: "First Name is required." }),
  lastName: z.string().min(1, { message: "Last Name is required." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional(),
  role: z.enum(ROLE_ARRAY, {
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

