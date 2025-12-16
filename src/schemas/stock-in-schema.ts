import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.number().min(1, { message: "Product is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  quantity: z.number().min(0.01, { message: "Quantity must be greater than 0." }),
  unitPrice: z.number().min(0, { message: "Unit price must be 0 or greater." }).optional(),
  totalPrice: z.number().min(0, { message: "Total price must be 0 or greater." }).optional(),
  currency: z.string().optional(),
  poNumber: z.string().optional(),
  invoiceNo: z.string().optional(),
  vendorName: z.string().optional(),
  grnNo: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  stockKeeperId: z.number().optional(),
  remarks: z.string().optional(),
});

export const stockInUpdateSchema = stockInSchema.partial();

export type StockInFormData = z.infer<typeof stockInSchema>;

