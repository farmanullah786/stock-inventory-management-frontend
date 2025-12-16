import { z } from "zod";

export const stockOutSchema = z.object({
  productId: z.number().min(1, { message: "Product is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  quantity: z.number().min(0.01, { message: "Quantity must be greater than 0." }),
  issuedToId: z.number().optional(),
  site: z.string().optional(),
  technicianId: z.number().optional(),
  remarks: z.string().optional(),
});

export const stockOutUpdateSchema = stockOutSchema.partial();

export type StockOutFormData = z.infer<typeof stockOutSchema>;

