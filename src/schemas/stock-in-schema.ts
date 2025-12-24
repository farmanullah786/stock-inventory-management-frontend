import { z } from "zod";

// Schema for individual stock-in item (one per GR item)
export const stockInItemSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required." }), // Product name from GR item (used to match GR item)
  vendorName: z.string().nullable().transform((val) => val ?? "").optional(),
  invoiceNo: z.string().nullable().transform((val) => val ?? "").optional(),
  stockKeeperId: z.number().optional(),
  // currency removed - comes from PR (shown in read-only price fields)
  remarks: z.string().optional(),
  // Removed duplicate fields that exist in GR/PR (auto-populated by backend):
  // - date: auto-set from GR receivedDate or current date
  // - quantity: from GR item quantityReceived
  // - unitPrice: from PR item unitPrice
  // - totalPrice: calculated from quantity * unitPrice
  // - poNumber: from PR prNumber
  // - grnNo: from GR grnNumber (kept for reference but auto-populated)
});

// Schema for creating multiple stock-in records at once
export const stockInSchema = z.object({
  goodsReceiptId: z.number().min(1, { message: "Goods Receipt is required." }), // Required - Stock In associated with GR ID
  items: z.array(stockInItemSchema).min(1, { message: "At least one item is required." }), // Array of items, one per GR item
  status: z.enum(["validated", "done", "cancelled"]).optional(),
  // Removed optional fields not used in form:
  // - location, scheduledDate, year, month (auto-calculated by backend)
});

// Schema for updating single stock-in record (for edit functionality)
export const stockInUpdateSchema = z.object({
  goodsReceiptId: z.number().min(1, { message: "Goods Receipt is required." }),
  productName: z.string().min(1, { message: "Product name is required." }),
  vendorName: z.string().nullable().transform((val) => val ?? "").optional(),
  invoiceNo: z.string().nullable().transform((val) => val ?? "").optional(),
  stockKeeperId: z.number().optional(),
  // currency removed - comes from PR (auto-populated by backend)
  remarks: z.string().optional(),
  status: z.enum(["validated", "done", "cancelled"]).optional(),
});

export type StockInFormData = z.infer<typeof stockInSchema>;
export type StockInItemFormData = z.infer<typeof stockInItemSchema>;
export type StockInUpdateFormData = z.infer<typeof stockInUpdateSchema>;

