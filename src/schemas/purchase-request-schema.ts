import { z } from "zod";

export const purchaseRequestItemSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required." }), // Manual product name entry (required)
  quantity: z.coerce.number().min(0.01, { message: "Quantity must be greater than 0." }),
  unitPrice: z.coerce.number().min(0, { message: "Unit price must be 0 or greater." }).optional(),
  totalPrice: z.coerce.number().min(0, { message: "Total price must be 0 or greater." }).optional(),
  currency: z.string().optional(),
  justification: z.string().optional(),
  specifications: z.string().optional(),
});

export const purchaseRequestSchema = z.object({
  requestedDate: z.string().min(1, { message: "Requested date is required." }),
  status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  justification: z.string().optional(),
  totalEstimatedCost: z.coerce.number().min(0).optional(),
  currency: z.string().optional(),
  budgetCode: z.string().optional(),
  department: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(purchaseRequestItemSchema).min(1, { message: "At least one item is required." }),
});

export const purchaseRequestUpdateSchema = purchaseRequestSchema.partial();

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;
export type PurchaseRequestItemFormData = z.infer<typeof purchaseRequestItemSchema>;

