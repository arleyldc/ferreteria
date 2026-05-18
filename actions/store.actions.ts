/**
 * @file actions/store.actions.ts
 * @description Server Actions for public store (shopping cart and checkout)
 */

"use server";

import { prisma } from "@/lib/prisma";
import { generateProductCode } from "@/lib/utils";
import type { ApiResponse } from "@/types";

/**
 * Get products available in store (public - no authentication required)
 */
export async function getStoreProducts(filters?: {
  categoryId?: string;
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<ApiResponse> {
  try {
    const limit = filters?.limit || 12;
    const skip = filters?.skip || 0;

    const products = await prisma.product.findMany({
      where: {
        stockCurrent: {
          gt: 0, // Only products with stock
        },
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { code: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        category: true,
        productPrices: {
          where: {
            customerType: {
              name: "MINORISTA", // Default to retail price for public store
            },
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: { name: "asc" },
    });

    const total = await prisma.product.count({
      where: {
        stockCurrent: { gt: 0 },
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { code: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
    });

    return {
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: { total, limit, skip, pages: Math.ceil(total / limit) },
      },
    };
  } catch (error: any) {
    console.error("[GET_STORE_PRODUCTS_ERROR]", error);
    return {
      success: false,
      message: "Error fetching products",
    };
  }
}

/**
 * Get product details for public store
 */
export async function getStoreProductDetail(
  productId: string,
): Promise<ApiResponse> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        productPrices: {
          where: {
            customerType: {
              name: "MINORISTA",
            },
          },
        },
        unitConversions: true,
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.stockCurrent <= 0) {
      return { success: false, message: "Product out of stock" };
    }

    return {
      success: true,
      message: "Product details fetched successfully",
      data: product,
    };
  } catch (error: any) {
    console.error("[GET_STORE_PRODUCT_DETAIL_ERROR]", error);
    return {
      success: false,
      message: "Error fetching product details",
    };
  }
}

/**
 * Get all product categories for store
 */
export async function getStoreCategories(): Promise<ApiResponse> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { stockCurrent: { gt: 0 } },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories.filter((cat) => cat.products.length > 0),
    };
  } catch (error: any) {
    console.error("[GET_STORE_CATEGORIES_ERROR]", error);
    return {
      success: false,
      message: "Error fetching categories",
    };
  }
}

/**
 * Get or create cart for session
 */
export async function getOrCreateCart(sessionId: string): Promise<ApiResponse> {
  try {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return {
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    };
  } catch (error: any) {
    console.error("[GET_OR_CREATE_CART_ERROR]", error);
    return {
      success: false,
      message: "Error managing cart",
    };
  }
}

/**
 * Add product to cart
 */
export async function addToCart(input: {
  sessionId: string;
  productId: string;
  quantity: number;
}): Promise<ApiResponse> {
  try {
    const { sessionId, productId, quantity } = input;

    // Validate quantity
    if (quantity <= 0) {
      return { success: false, message: "Quantity must be greater than 0" };
    }

    // Get product with pricing
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productPrices: {
          where: {
            customerType: {
              name: "MINORISTA",
            },
          },
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.stockCurrent < quantity) {
      return {
        success: false,
        message: `Only ${product.stockCurrent} units available`,
      };
    }

    const price = product.productPrices[0]?.price || product.costPriceAvg || 0;

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
      });
    }

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem: any;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          subtotal: (existingItem.quantity + quantity) * price,
        },
      });
    } else {
      // Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price,
          subtotal: quantity * price,
        },
      });
    }

    // Update cart subtotal
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    await prisma.cart.update({
      where: { id: cart.id },
      data: { subtotal },
    });

    return {
      success: true,
      message: "Product added to cart",
      data: cartItem,
    };
  } catch (error: any) {
    console.error("[ADD_TO_CART_ERROR]", error);
    return {
      success: false,
      message: "Error adding product to cart",
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(input: {
  cartItemId: string;
  quantity: number;
}): Promise<ApiResponse> {
  try {
    const { cartItemId, quantity } = input;

    if (quantity <= 0) {
      return { success: false, message: "Quantity must be greater than 0" };
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem) {
      return { success: false, message: "Cart item not found" };
    }

    if (cartItem.product.stockCurrent < quantity) {
      return {
        success: false,
        message: `Only ${cartItem.product.stockCurrent} units available`,
      };
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        subtotal: quantity * cartItem.price,
      },
    });

    // Update cart subtotal
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { subtotal: subtotal + updatedItem.subtotal - cartItem.subtotal },
    });

    return {
      success: true,
      message: "Cart item updated",
      data: updatedItem,
    };
  } catch (error: any) {
    console.error("[UPDATE_CART_ITEM_ERROR]", error);
    return {
      success: false,
      message: "Error updating cart item",
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string): Promise<ApiResponse> {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return { success: false, message: "Cart item not found" };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    // Update cart subtotal
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { subtotal },
    });

    return {
      success: true,
      message: "Item removed from cart",
    };
  } catch (error: any) {
    console.error("[REMOVE_FROM_CART_ERROR]", error);
    return {
      success: false,
      message: "Error removing item from cart",
    };
  }
}

/**
 * Clear cart
 */
export async function clearCart(cartId: string): Promise<ApiResponse> {
  try {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });

    await prisma.cart.update({
      where: { id: cartId },
      data: { subtotal: 0 },
    });

    return {
      success: true,
      message: "Cart cleared",
    };
  } catch (error: any) {
    console.error("[CLEAR_CART_ERROR]", error);
    return {
      success: false,
      message: "Error clearing cart",
    };
  }
}

/**
 * Checkout - Create sale from cart
 */
export async function checkoutCart(input: {
  cartId: string;
  customerName: string;
  paymentMethod: string;
}): Promise<ApiResponse> {
  try {
    const { cartId, customerName, paymentMethod } = input;

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      return { success: false, message: "Cart not found" };
    }

    if (cart.items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    // Get or create MINORISTA customer type
    let customerType = await prisma.customerType.findUnique({
      where: { name: "MINORISTA" },
    });

    if (!customerType) {
      customerType = await prisma.customerType.create({
        data: { name: "MINORISTA" },
      });
    }

    // Create system user for online sales
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@store.local" },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: "system@store.local",
          name: "Sistema Tienda",
          password: "system", // Will be hashed by middleware
          role: "VENDEDOR",
        },
      });
    }

    // Generate sale number
    const saleNumberBase = Math.floor(Date.now() / 1000);
    const saleNumber = `ONLINE-${saleNumberBase}`;

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        customerTypeId: customerType.id,
        customerName,
        total: cart.subtotal,
        discount: 0,
        paymentMethod,
        userId: systemUser.id,
      },
    });

    // Create sale items and update inventory
    for (const cartItem of cart.items) {
      // Create sale item
      await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.price,
          subtotal: cartItem.subtotal,
        },
      });

      // Update product stock
      const product = await prisma.product.findUnique({
        where: { id: cartItem.productId },
      });

      if (product) {
        const newStock = product.stockCurrent - cartItem.quantity;

        await prisma.product.update({
          where: { id: cartItem.productId },
          data: {
            stockCurrent: newStock,
            totalStockValue: newStock * product.costPriceAvg,
          },
        });

        // Create inventory movement
        await prisma.inventoryMovement.create({
          data: {
            productId: cartItem.productId,
            type: "EXIT",
            subType: "salida_punto_venta",
            quantity: cartItem.quantity,
            quantityInBase: cartItem.quantity,
            unitUsed: product.unitBase,
            unitPrice: cartItem.price,
            documentNumber: saleNumber,
            reason: `Venta online - ${customerName}`,
            userId: systemUser.id,
            customerName,
          },
        });
      }
    }

    // Clear cart
    await clearCart(cartId);

    return {
      success: true,
      message: "Order completed successfully",
      data: {
        saleId: sale.id,
        saleNumber: sale.saleNumber,
        total: sale.total,
      },
    };
  } catch (error: any) {
    console.error("[CHECKOUT_CART_ERROR]", error);
    return {
      success: false,
      message: "Error processing checkout",
    };
  }
}
