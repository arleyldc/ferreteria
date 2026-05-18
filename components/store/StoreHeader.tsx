"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";

export function StoreHeader() {
  const cart = useCartStore((state) => state.cart);
  const itemsCount = cart?.items?.length || 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/store" className="text-2xl font-bold text-blue-600">
          Ferretería
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link href="/store" className="text-sm hover:text-blue-600">
            Productos
          </Link>
          <Link href="/store/checkout" className="text-sm hover:text-blue-600">
            Mi Carrito
          </Link>
        </nav>

        <Link href="/store/checkout">
          <Button variant="outline" size="sm" className="relative">
            <ShoppingCart className="w-4 h-4" />
            <span className="ml-2">{itemsCount}</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
