"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

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
