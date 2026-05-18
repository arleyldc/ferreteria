import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/[id]
 * Retrieve a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        productPrices: {
          include: { customerType: { select: { name: true } } },
        },
        unitConversions: true,
        movements: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        code: product.code,
        name: product.name,
        description: (product as any).description,
        categoryId: (product as any).categoryId,
        categoryName: product.category.name,
        stockCurrent: (product as any).stockCurrent,
        minimumStock: (product as any).minimumStock,
        costPriceAvg: (product as any).costPriceAvg,
        baseUnit: (product as any).baseUnit,
        isFractionable: (product as any).isFractionable,
        imageUrl: (product as any).imageUrl,
        prices: product.productPrices,
        unitConversions: product.unitConversions,
        movements: product.movements,
      },
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
