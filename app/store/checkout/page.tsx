"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { checkoutCart } from "@/actions/store.actions";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const cart = useCartStore((state) => state.cart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const loading = useCartStore((state) => state.loading);

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/store"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">
            Agrega productos a tu carrito para continuar
          </p>
          <Link href="/store">
            <Button>Ir a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
      toast({
        title: "Éxito",
        description: "Producto removido del carrito",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo remover el producto",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(cartItemId);
      return;
    }

    try {
      await updateItem(cartItemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await checkoutCart({
        cartId: cart.id,
        customerName,
        paymentMethod,
      });

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: `Pedido completado. Número: ${response.data?.saleNumber}`,
        });

        // Redirect to confirmation page
        router.push(
          `/store/confirmation?saleNumber=${response.data?.saleNumber}`,
        );
      } else {
        toast({
          title: "Error",
          description: response.message || "No se pudo completar la compra",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error procesando la compra",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Link
        href="/store"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la tienda
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-2">Carrito de Compra</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product?.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    ${item.price.toFixed(2)} x unidad
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={loading}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg mb-4">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Checkout Form */}
        <div>
          <Card className="p-6 sticky top-24 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Resumen</h2>
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={submitting || loading}
                className="w-full"
                size="lg"
              >
                {submitting ? "Procesando..." : "Completar Compra"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Tu pedido será procesado inmediatamente
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
