"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@prisma/client";

interface ProductCardProps {
  product: any; // Product with category and productPrices
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const price = product.productPrices?.[0]?.price || product.costPriceAvg || 0;

  const handleAddToCart = async () => {
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addItem(product.id, quantity, price);
      toast({
        title: "Éxito",
        description: "Producto agregado al carrito",
      });
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
      <div className="bg-gray-100 rounded h-48 mb-4 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">Imagen no disponible</div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <p className="text-xs text-gray-600">{product.description}</p>

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-blue-600">
            ${price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            {product.stockCurrent} {product.unitBase}
          </span>
        </div>

        <div className="flex gap-2 pt-4">
          <div className="flex items-center border rounded flex-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100"
              disabled={loading}
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="flex-1 text-center px-2 py-1 border-0 text-sm"
              min="1"
              disabled={loading}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar
        </Button>
      </div>
    </div>
  );
}
