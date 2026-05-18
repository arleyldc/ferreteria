/**
 * @file actions/product.actions.ts
 * @description Server Actions for product management
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateProductCode } from "@/lib/utils";
import type { Role } from "@prisma/client";
import {
  productSchema,
  type ProductInput,
} from "@/lib/validations/product.schema";
import type { ApiResponse, ProductDetail } from "@/types";

/**
 * Create a new product
 */
export async function createProduct(input: ProductInput): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role === "VENDEDOR") {
      return { success: false, message: "Unauthorized" };
    }

    const validated = productSchema.parse(input);

    // Generate code if not provided
    const code = validated.code || generateProductCode();

    // Check if code already exists
    const existing = await prisma.product.findUnique({
      where: { code },
    });

    if (existing) {
      return { success: false, message: "Product code already exists" };
    }

    const product = await prisma.product.create({
      data: {
        code,
        name: validated.name,
        description: validated.description,
        categoryId: validated.categoryId,
        unitBase: validated.unitBase,
        isFractionable: validated.isFractionable,
        stockMin: validated.stockMin,
        stockCurrent: validated.stockCurrent || 0,
        costPriceAvg: validated.costPriceAvg || 0,
        location: validated.location,
        imageUrl: validated.imageUrl,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actionType: "CREATE_PRODUCT",
        details: { productId: product.id, code, name: product.name },
      },
    });

    return {
      success: true,
      message: "Product created successfully",
      data: { productId: product.id, code },
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return { success: false, message: "Product code already exists" };
    }
    return { success: false, message: "Failed to create product" };
  }
}

/**
 * Update product details
 */
export async function updateProduct(
  productId: string,
  input: ProductInput,
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = productSchema.parse(input);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: validated.name,
        description: validated.description,
        categoryId: validated.categoryId,
        unitBase: validated.unitBase,
        isFractionable: validated.isFractionable,
        stockMin: validated.stockMin,
        stockCurrent: validated.stockCurrent,
        costPriceAvg: validated.costPriceAvg,
        location: validated.location,
        imageUrl: validated.imageUrl,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actionType: "UPDATE_PRODUCT",
        details: { productId, changes: validated },
      },
    });

    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, message: "Failed to update product" };
  }
}

/**
 * Get product details with conversions and prices
 */
export async function getProductDetail(
  productId: string,
): Promise<ApiResponse<ProductDetail>> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { name: true } },
        unitConversions: {
          select: { unitName: true, quantityInBase: true, isDefault: true },
        },
        productPrices: {
          include: { customerType: { select: { name: true } } },
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    const detail: ProductDetail = {
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      categoryName: product.category.name,
      unitBase: product.unitBase,
      stockCurrent: product.stockCurrent,
      stockMin: product.stockMin,
      costPriceAvg: product.costPriceAvg,
      totalStockValue: product.totalStockValue,
      location: product.location,
      imageUrl: product.imageUrl,
      isFractionable: product.isFractionable,
      unitConversions: product.unitConversions,
      prices: product.productPrices.map((pp) => ({
        customerType: pp.customerType.name,
        price: pp.price,
      })),
    };

    return {
      success: true,
      data: detail,
      message: "Product details fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, message: "Failed to fetch product" };
  }
}

/**
 * Get all products with pagination
 */
export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { name: "asc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        products: products.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          categoryName: p.category.name,
          stockCurrent: p.stockCurrent,
          stockMin: p.stockMin,
          costPriceAvg: p.costPriceAvg,
          totalStockValue: p.totalStockValue,
        })),
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, message: "Failed to fetch products" };
  }
}

/**
 * Delete product (only if no movements exist)
 */
export async function deleteProduct(productId: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

    const movements = await prisma.inventoryMovement.findFirst({
      where: { productId },
    });

    if (movements) {
      return {
        success: false,
        message: "Cannot delete product with movements",
      };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actionType: "DELETE_PRODUCT",
        details: { productId },
      },
    });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product" };
  }
}
