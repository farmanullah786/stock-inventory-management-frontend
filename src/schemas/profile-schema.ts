import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Invalid email address"),
  phoneNumber: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

