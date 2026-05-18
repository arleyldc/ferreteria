"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recordStockExit } from "@/actions/movement.actions";
import { formatCurrency, formatNumber } from "@/lib/utils";

/**
 * Stock Exit Form - Record product sales and adjustments
 */
export default function StockExitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [exitType, setExitType] = useState("VENTA");
  const [quantity, setQuantity] = useState("");

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

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
    setQuantity("");
  };

  const availableQuantity = selectedProduct?.stockCurrent || 0;
  const hasEnoughStock = parseFloat(quantity) <= availableQuantity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!hasEnoughStock) {
      setError(
        `Stock insuficiente. Disponible: ${formatNumber(availableQuantity)}`,
      );
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);

      const result = await recordStockExit({
        productId: formData.get("productId") as string,
        quantity: parseFloat(quantity),
        documentNumber: formData.get("documentNumber") as string,
        type: "EXIT",
        subType: "",
        unitUsed: "",
      });

      if (!result.success) {
        setError(result.message || "Error al registrar salida");
        return;
      }

      router.push("/movements/history");
    } catch (err: any) {
      setError(err.message || "Error al registrar salida de stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          📤 Salida de Stock
        </h1>
        <p className="text-slate-600 mt-1">
          Registra ventas, mermas o ajustes de inventario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Información de Salida</CardTitle>
            <CardDescription>
              Registra salidas de mercancía del inventario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exit Type */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Tipo de Salida *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    value: "VENTA",
                    label: "🛒 Venta POS",
                    desc: "Venta en punto de venta",
                  },
                  {
                    value: "AJUSTE",
                    label: "⚙️ Ajuste",
                    desc: "Corrección de inventario",
                  },
                  { value: "MERMA", label: "⚠️ Merma", desc: "Pérdida o daño" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      exitType === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exitType"
                      value={opt.value}
                      checked={exitType === opt.value}
                      onChange={(e) => setExitType(e.target.value)}
                      className="mr-2"
                    />
                    <div className="font-medium text-slate-500">
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {opt.desc}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de Documento{" "}
                {exitType === "VENTA" || exitType === "AJUSTE" ? "*" : ""}
              </label>
              <input
                type="text"
                name="documentNumber"
                required={exitType === "VENTA" || exitType === "AJUSTE"}
                className="w-full px-3 py-2 border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder={
                  exitType === "VENTA" ? "Ej: VENTA-001" : "Ej: ADJ-001"
                }
              />
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Producto *
              </label>
              <select
                name="productId"
                required
                onChange={handleProductChange}
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Selecciona un producto --</option>
                {products
                  .filter((p) => p.stockCurrent > 0)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name} ({product.stockCurrent}{" "}
                      disponible)
                    </option>
                  ))}
              </select>
            </div>

            {/* Product Info */}
            {selectedProduct && (
              <div
                className={`p-4 border rounded-lg ${
                  hasEnoughStock
                    ? "bg-blue-50 border-blue-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Stock Disponible</p>
                    <p className="font-bold text-slate-900">
                      {formatNumber(selectedProduct.stockCurrent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Costo Unitario</p>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(selectedProduct.costPriceAvg)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Unidad</p>
                    <p className="font-bold text-slate-900">
                      {selectedProduct.baseUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Stock Mínimo</p>
                    <p className="font-bold text-slate-900">
                      {formatNumber(selectedProduct.minimumStock)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cantidad{" "}
                {selectedProduct?.baseUnit
                  ? `(${selectedProduct.baseUnit})`
                  : ""}{" "}
                *
              </label>
              <input
                type="number"
                name="quantity"
                required
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                  hasEnoughStock
                    ? "border-slate-300 text-slate-800 focus:border-blue-500"
                    : "border-red-300 text-slate-800"
                }`}
                placeholder="0.00"
              />
              {selectedProduct && quantity && !hasEnoughStock && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Stock insuficiente. Disponible:{" "}
                  {formatNumber(availableQuantity)}
                </p>
              )}
              {selectedProduct && quantity && hasEnoughStock && (
                <p className="text-green-600 text-sm mt-2">
                  ✅ Stock suficiente. Costo total:{" "}
                  {formatCurrency(
                    parseFloat(quantity) * selectedProduct.costPriceAvg,
                  )}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Observaciones
              </label>
              <textarea
                name="notes"
                className="w-full px-3 py-2 border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Notas adicionales sobre la salida"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading || !hasEnoughStock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 font-medium"
              >
                {loading ? "Registrando..." : "✅ Registrar Salida"}
              </button>
              <Link
                href="/dashboard/movements/history"
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 font-medium text-center"
              >
                Cancelar
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Información</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Se validará automáticamente que haya suficiente stock</p>
          <p>• El costo promedio se utiliza para valorar la salida</p>
          <p>• Los ajustes se registran en el historial de movimientos</p>
        </CardContent>
      </Card>
    </div>
  );
}
