"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSale } from "@/actions/sale.actions";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface CartItem {
  id: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  costPrice: number;
}

/**
 * Point of Sale (POS) System
 */
export default function POSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerType, setCustomerType] = useState("MINORISTA");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Error al cargar productos");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          code: product.code,
          name: product.name,
          price: product.costPriceAvg * 1.5, // Default 50% markup
          quantity: 1,
          costPrice: product.costPriceAvg,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalCost = cart.reduce(
    (acc, item) => acc + item.costPrice * item.quantity,
    0,
  );
  const profit = subtotal - totalCost;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const result = await createSale({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: notes || undefined,
      });

      if (!result.success) {
        alert("Error: " + result.message);
        return;
      }

      // Reset cart
      setCart([]);
      setNotes("");
      alert("✅ Venta registrada exitosamente");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          💳 Punto de Venta (POS)
        </h1>
        <p className="text-slate-600 mt-1">Sistema de caja y ventas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 border border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <div className="font-bold text-sm text-slate-500">
                      {product.code}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {product.name}
                    </div>
                    <div className="text-sm font-bold text-green-600 mt-1">
                      {formatCurrency(product.costPriceAvg * 1.5)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Stock: {formatNumber(product.stockCurrent)}
                    </div>
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No hay productos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🛒 Carrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 text-slate-600 rounded text-sm"
                >
                  <option value="MINORISTA">🛒 Minorista</option>
                  <option value="MAYORISTA">📦 Mayorista</option>
                  <option value="CONSTRUCTOR">👷 Constructor</option>
                  <option value="INSTITUCIONAL">🏢 Institucional</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 text-slate-600 rounded text-sm"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="TARJETA">💳 Tarjeta</option>
                  <option value="CHEQUE">📄 Cheque</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                </select>
              </div>

              {/* Cart Items */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-sm mb-2">
                  Items ({cart.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Carrito vacío
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-slate-50 rounded border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-bold text-xs text-slate-600">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 ">
                              {item.code}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 text-xs hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center gap-1 justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="px-1 py-0.5 bg-slate-300 rounded hover:bg-slate-400"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-slate-600">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-1 py-0.5 bg-slate-300 rounded hover:bg-slate-400"
                            >
                              +
                            </button>
                          </div>
                          <div className="font-bold text-green-600">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Ganancia:</span>
                  <span className="font-bold">{formatCurrency(profit)}</span>
                </div>
                <div className="border-t pt-2 bg-blue-50 p-2 rounded">
                  <div className="flex justify-between font-bold text-base text-slate-600">
                    <span>Total:</span>
                    <span className="text-blue-600 ">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de la venta (opcional)"
                className="w-full px-2 py-1 text-xs border border-slate-500 text-slate-600 rounded resize-none"
                rows={2}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => setCart([])}
                  className="flex-1 px-2 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold text-sm"
                >
                  🗑️ Limpiar
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  className="flex-1 px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-400 font-bold text-sm"
                >
                  {loading ? "Procesando..." : "✅ Cobrar"}
                </button>
              </div>

              <Link
                href="/movements/exit"
                className="block w-full text-center px-2 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-bold"
              >
                Salida Manual
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
