/**
 * @file lib/validations/movement.schema.ts
 * @description Inventory movement validation schemas
 */

import { z } from "zod";

export const inventoryMovementSchema = z.object({
  productId: z.string().min(1, "Product required"),
  type: z.enum(["ENTRY", "EXIT"], {
    errorMap: () => ({ message: "Invalid movement type" }),
  }),
  subType: z.string().min(1, "Movement subtype required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitUsed: z.string().min(1, "Unit required"),
  unitPrice: z.coerce
    .number()
    .positive("Unit price must be positive")
    .optional(),
  documentNumber: z.string().optional(),
  reason: z.string().optional(),
  customerName: z.string().optional(),
});

export type InventoryMovementInput = z.infer<typeof inventoryMovementSchema>;

export const stockEntrySchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitUsed: z.string().min(1, "Unit required"),
  costPrice: z.coerce.number().positive("Cost price must be positive"),
  documentNumber: z.string().optional(),
  reason: z.string().optional(),
});

export type StockEntryInput = z.infer<typeof stockEntrySchema>;

export const stockExitSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitUsed: z.string().min(1, "Unit required"),
  subType: z.enum(["venta", "merma", "ajuste", "traslado"], {
    errorMap: () => ({ message: "Invalid exit type" }),
  }),
  reason: z.string().optional(),
  customerName: z.string().optional(),
  quantityInBase: z.coerce
    .number()
    .positive("Quantity in base unit must be positive")
    .optional(),
  unitPrice: z.coerce
    .number()
    .positive("Unit price must be positive")
    .optional(),
  userId: z.string(),
});

export type StockExitInput = z.infer<typeof stockExitSchema>;
