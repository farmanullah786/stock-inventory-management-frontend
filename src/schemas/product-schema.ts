import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }),
  categoryId: z.number().min(1, { message: "Category is required." }),
  unit: z.string().min(1, { message: "Unit is required." }),
  description: z.string().optional(),
  openingStock: z.number().int().min(0, { message: "Opening stock must be a whole number (0 or greater)." }).optional(),
  isActive: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();

export type ProductFormData = z.infer<typeof productSchema>;

