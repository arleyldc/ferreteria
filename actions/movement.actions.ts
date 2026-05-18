/**
 * @file actions/movement.actions.ts
 * @description Server Actions for inventory movements
 * CRITICAL: Contains weighted average cost price calculation logic
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  calculateWeightedAverageCost,
  generateDocumentNumber,
  getClientIp,
} from "@/lib/utils";
import {
  inventoryMovementSchema,
  type InventoryMovementInput,
} from "@/lib/validations/movement.schema";
import type { ApiResponse } from "@/types";
import z from "zod";
import { calculateInventoryValue, convertToBase } from "@/lib/inventory";
import { revalidatePath } from "next/cache";
import { stockExitSchema } from "@/lib/validations/movement.schema";
/**
 * Record stock entry (purchase)
 * CRITICAL FUNCTION: Calculates and updates weighted average cost price
 *
 * Formula: newCostAvg = ((currentStock × currentCostPrice) + (newQuantity × newCostPrice)) / (currentStock + newQuantity)
 *
 * This ensures that the product's cost price accurately reflects all historical purchases
 */
export async function recordStockEntry(
  input: InventoryMovementInput,
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Validate input
    const validated = inventoryMovementSchema.parse(input);

    // Get product with unit conversions
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      include: { unitConversions: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Convert quantity to base unit
    let quantityInBase = validated.quantity;
    const unitConversion = product.unitConversions.find(
      (uc) => uc.unitName === validated.unitUsed || uc.isDefault,
    );

    if (unitConversion) {
      quantityInBase = validated.quantity * unitConversion.quantityInBase;
    }

    // Validate quantity for non-fractionable products
    if (!product.isFractionable && quantityInBase % 1 !== 0) {
      return {
        success: false,
        message: "This product does not accept fractional quantities",
      };
    }

    if (!validated.unitPrice) {
      return { success: false, message: "Unit price required for stock entry" };
    }

    // CRITICAL: Calculate new weighted average cost price
    const newCostPriceAvg = calculateWeightedAverageCost(
      product.stockCurrent,
      product.costPriceAvg,
      quantityInBase,
      validated.unitPrice,
    );

    // Calculate new stock and total value
    const newStockCurrent = product.stockCurrent + quantityInBase;
    const newTotalStockValue = newStockCurrent * newCostPriceAvg;

    // Generate document number if not provided
    const documentNumber =
      validated.documentNumber || generateDocumentNumber("ENT");

    // Create movement record and update product in transaction
    const [movement, updatedProduct] = await prisma.$transaction([
      // Create movement record
      prisma.inventoryMovement.create({
        data: {
          productId: validated.productId,
          type: "ENTRY",
          subType: validated.subType,
          quantity: validated.quantity,
          quantityInBase,
          unitUsed: validated.unitUsed,
          unitPrice: validated.unitPrice,
          documentNumber,
          reason: validated.reason,
          userId: session.user.id,
          customerName: validated.customerName,
        },
      }),
      // Update product stock and cost price
      prisma.product.update({
        where: { id: validated.productId },
        data: {
          stockCurrent: newStockCurrent,
          costPriceAvg: newCostPriceAvg,
          totalStockValue: newTotalStockValue,
        },
      }),
      // Log audit entry
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          actionType: "STOCK_ENTRY",
          details: {
            productId: validated.productId,
            productCode: product.code,
            quantity: quantityInBase,
            costPrice: validated.unitPrice,
            newCostAvg: newCostPriceAvg,
            newStock: newStockCurrent,
            documentNumber,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: "Stock entry recorded successfully",
      data: {
        movementId: movement.id,
        documentNumber,
        newStock: newStockCurrent,
        newCostPrice: newCostPriceAvg,
      },
    };
  } catch (error) {
    console.error("Error recording stock entry:", error);
    return { success: false, message: "Failed to record stock entry" };
  }
}

/**
 * Record stock exit (sale, waste, transfer)
 */
export async function recordStockExit(
  input: InventoryMovementInput,
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = inventoryMovementSchema.parse(input);

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      include: { unitConversions: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Convert quantity to base unit
    let quantityInBase = validated.quantity;
    const unitConversion = product.unitConversions.find(
      (uc) => uc.unitName === validated.unitUsed || uc.isDefault,
    );

    if (unitConversion) {
      quantityInBase = validated.quantity * unitConversion.quantityInBase;
    }

    // Validate stock availability
    if (quantityInBase > product.stockCurrent) {
      return {
        success: false,
        message: `Insufficient stock. Available: ${product.stockCurrent} ${product.unitBase}`,
      };
    }

    // Validate quantity for non-fractionable products
    if (!product.isFractionable && quantityInBase % 1 !== 0) {
      return {
        success: false,
        message: "This product does not accept fractional quantities",
      };
    }

    const documentNumber =
      validated.documentNumber || generateDocumentNumber("SAL");
    const newStockCurrent = product.stockCurrent - quantityInBase;
    const newTotalStockValue = newStockCurrent * product.costPriceAvg;

    const [movement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          productId: validated.productId,
          type: "EXIT",
          subType: validated.subType,
          quantity: validated.quantity,
          quantityInBase,
          unitUsed: validated.unitUsed,
          unitPrice: validated.unitPrice,
          documentNumber,
          reason: validated.reason,
          userId: session.user.id,
          customerName: validated.customerName,
        },
      }),
      prisma.product.update({
        where: { id: validated.productId },
        data: {
          stockCurrent: newStockCurrent,
          totalStockValue: newTotalStockValue,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          actionType: "STOCK_EXIT",
          details: {
            productId: validated.productId,
            productCode: product.code,
            quantity: quantityInBase,
            subType: validated.subType,
            newStock: newStockCurrent,
            documentNumber,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: "Stock exit recorded successfully",
      data: {
        movementId: movement.id,
        documentNumber,
        newStock: newStockCurrent,
      },
    };
  } catch (error) {
    console.error("Error recording stock exit:", error);
    return { success: false, message: "Failed to record stock exit" };
  }
}

/**
 * Get inventory movements with filters
 */
export async function getMovements(filters?: {
  productId?: string;
  type?: "ENTRY" | "EXIT";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};

    if (filters?.productId) where.productId = filters.productId;
    if (filters?.type) where.type = filters.type;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: { select: { code: true, name: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { success: true, data: { movements, total } };
  } catch (error) {
    console.error("Error getting movements:", error);
    return { success: false, message: "Failed to fetch movements" };
  }
}

export async function registerStockExit(
  input: z.infer<typeof stockExitSchema>,
) {
  const data = stockExitSchema.parse(input);

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const quantityBase = convertToBase(data.quantity, data.quantityInBase || 1);

    if (product.stockCurrent < quantityBase) {
      throw new Error("Stock insuficiente");
    }

    const newStock = product.stockCurrent - quantityBase;

    const totalStockValue = calculateInventoryValue(
      newStock,
      product.costPriceAvg,
    );

    const movement = await tx.inventoryMovement.create({
      data: {
        productId: product.id,
        type: "EXIT",
        subType: data.subType,
        quantity: data.quantity,
        quantityInBase: quantityBase,
        unitUsed: data.unitUsed,
        reason: data.reason,
        userId: data.userId,
        customerName: data.customerName,
        unitPrice: data.unitPrice,
      },
    });

    await tx.product.update({
      where: {
        id: product.id,
      },
      data: {
        stockCurrent: newStock,
        totalStockValue,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: data.userId,
        actionType: "STOCK_EXIT",
        details: {
          productId: product.id,
          previousStock: product.stockCurrent,
          newStock,
          quantityBase,
        },
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");

    return movement;
  });
}
