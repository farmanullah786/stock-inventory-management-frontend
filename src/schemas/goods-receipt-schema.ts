import { z } from "zod";

export const goodsReceiptItemSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required." }),
  quantityReceived: z.coerce.number().min(0, { message: "Quantity received cannot be negative." }),
  quantityExpected: z.coerce.number().min(0.01, { message: "Quantity expected must be greater than 0." }),
  condition: z.enum(["good", "damaged", "missing", "expired"]).optional(),
  remarks: z.string().optional(),
});

export const goodsReceiptSchema = z.object({
  purchaseRequestId: z.number().min(1, { message: "Purchase Request is required." }),
  receivedDate: z.string().min(1, { message: "Received date is required." }),
  status: z.enum(["pending", "partial", "complete", "rejected"]).optional(),
  condition: z.enum(["good", "damaged", "missing", "expired"]).optional(),
  remarks: z.string().optional(),
  rejectionReason: z.string().optional(),
  items: z.array(goodsReceiptItemSchema).min(1, { message: "At least one item is required." }),
});

export const goodsReceiptUpdateSchema = goodsReceiptSchema.partial();

export type GoodsReceiptFormData = z.infer<typeof goodsReceiptSchema>;
export type GoodsReceiptItemFormData = z.infer<typeof goodsReceiptItemSchema>;

