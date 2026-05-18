"use client";

import { useEffect, useState } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { useCartStore } from "@/lib/cart-store";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    setMounted(true);
    initializeCart();
  }, [initializeCart]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
