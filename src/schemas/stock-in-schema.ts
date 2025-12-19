import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.number().min(1, { message: "Product is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  quantity: z.coerce.number().min(1,{ message: "Quantity must be greater than 0." }),
  unitPrice: z.coerce.number().min(0, { message: "Unit price must be 0 or greater." }).optional(),
  totalPrice: z.coerce.number().min(0, { message: "Total price must be 0 or greater." }).optional(),
  currency: z.string().optional(),
  poNumber: z.string().optional(),
  invoiceNo: z.string().optional(),
  vendorName: z.string().optional(),
  grnNo: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(), // Auto-calculated from date, not shown in form
  month: z.number().int().min(1).max(12).optional(), // Auto-calculated from date, not shown in form
  stockKeeperId: z.number().optional(),
  location: z.string().optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(["draft", "validated", "done", "cancelled"]).optional(),
  remarks: z.string().optional(),
});

export const stockInUpdateSchema = stockInSchema.partial();

export type StockInFormData = z.infer<typeof stockInSchema>;

