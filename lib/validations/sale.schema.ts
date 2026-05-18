/**
 * @file lib/validations/sale.schema.ts
 * @description Sales/POS validation schemas
 */

import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
});

export type SaleItemInput = z.infer<typeof saleItemSchema>;

export const saleSchema = z.object({
  customerTypeId: z.string().min(1, "Customer type required"),
  customerName: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item required"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").default(0),
  paymentMethod: z.enum(["cash", "card", "transfer"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
});

export type SaleInput = z.infer<typeof saleSchema>;
