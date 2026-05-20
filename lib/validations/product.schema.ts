/**
 * @file lib/validations/product.schema.ts
 * @description Product management validation schemas
 */

import { z } from "zod";

export const productSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").optional(),
  name: z.string().min(2, "Product name required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category required"),
  unitBase: z.string().min(1, "Base unit required"),
  isFractionable: z.boolean().default(false),
  stockMin: z.coerce.number().int().min(0, "Minimum stock must be positive"),
  stockCurrent: z.coerce
    .number()
    .min(0, "Current stock must be positive")
    .optional(),
  costPriceAvg: z.coerce
    .number()
    .min(0, "Cost price must be positive")
    .optional(),
  location: z.string().optional(),
  imageUrl: z.string().url("Image URL must be valid").optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const unitConversionSchema = z.object({
  unitName: z.string().min(1, "Unit name required"),
  quantityInBase: z.coerce.number().positive("Quantity must be positive"),
  isDefault: z.boolean().default(false),
});

export type UnitConversionInput = z.infer<typeof unitConversionSchema>;

export const productPriceSchema = z.object({
  customerTypeId: z.string().min(1, "Customer type required"),
  price: z.coerce.number().positive("Price must be positive"),
});

export type ProductPriceInput = z.infer<typeof productPriceSchema>;
