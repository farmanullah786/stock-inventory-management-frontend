import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryFormData = z.infer<typeof categorySchema>;

