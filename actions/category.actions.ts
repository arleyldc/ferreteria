/**
 * @file actions/category.actions.ts
 * @description Server Actions for category management
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

/**
 * Get all categories
 */
export async function getCategories(): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories,
      message: "Categoris Ready for use",
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}
