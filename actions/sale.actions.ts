"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";
import { updateProduct } from "./product.actions";

/**
 * Create a new sale
 */
export async function createSale(input: {
  items: { productId: string; quantity: number; price: number }[];
  notes?: string;
}): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Create sale record
    // TODO: Implement sale creation logic
    for (const item of input.items) {
      // Update product stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;

      const newStock = product.stockCurrent - item.quantity;
      await updateProduct(item.productId, {
        stockCurrent: newStock,
        stockMin: product.stockMin,
        costPriceAvg: product.costPriceAvg,
        price: product.price,
        unitBase: product.unitBase,
        categoryId: product.categoryId,
        name: product.name,
        isFractionable: product.isFractionable,
      });
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "EXIT",
          subType: "VENTA",
          quantity: item.quantity,
          unitPrice: item.price,
          reason: input.notes,
          customerName: "Cliente genérico",
          unitUsed: product.unitBase,
          documentNumber: `SALE-${Date.now()}`,
          userId: session.user.id,
          quantityInBase: item.quantity,
        },
      });
    }
    return {
      success: true,
      message: "Sale created successfully",
    };
  } catch (error) {
    console.error("[CREATE_SALE_ERROR]", error);
    return {
      success: false,
      message: "Error creating sale",
    };
  }
}
