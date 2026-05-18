import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products
 * Retrieve all products with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          productPrices: {
            include: { customerType: { select: { name: true } } },
          },
        },
        orderBy: { name: "asc" },
        take: limit,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        categoryId: (p as any).categoryId,
        categoryName: p.category.name,
        stockCurrent: (p as any).stockCurrent,
        minimumStock: (p as any).minimumStock,
        costPriceAvg: (p as any).costPriceAvg,
        baseUnit: (p as any).baseUnit,
        imageUrl: (p as any).imageUrl,
        prices: p.productPrices,
      })),
      total,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
