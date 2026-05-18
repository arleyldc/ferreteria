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
import { recordStockEntry } from "@/actions/movement.actions";
import { formatCurrency, formatNumber } from "@/lib/utils";

/**
 * Stock Entry Form - Record product purchases
 */
export default function StockEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

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
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      const result = await recordStockEntry({
        productId: formData.get("productId") as string,
        quantity: parseFloat(formData.get("quantity") as string),
        unitPrice: parseFloat(formData.get("unitPrice") as string),
        documentNumber: formData.get("documentNumber") as string,
        type: "ENTRY",
        subType: "",
        unitUsed: "",
        reason: (formData.get("notes") as string) || undefined,
        customerName: (formData.get("supplier") as string) || undefined,
      });

      if (!result.success) {
        setError(result.message || "Error al registrar entrada");
        return;
      }

      router.push("/movements/history");
    } catch (err: any) {
      setError(err.message || "Error al registrar entrada de stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          📥 Entrada de Stock
        </h1>
        <p className="text-slate-600 mt-1">
          Registra compras y reposiciones de inventario
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
            <CardTitle>Información de Entrada</CardTitle>
            <CardDescription>
              Completa los datos de la compra o reposición
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de Documento (Factura/Remisión) *
              </label>
              <input
                type="text"
                name="documentNumber"
                required
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: FAC-001, REM-2024-001"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Proveedor
              </label>
              <input
                type="text"
                name="supplier"
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Nombre del proveedor"
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
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name} ({product.stockCurrent}{" "}
                    {product.baseUnit})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Info */}
            {selectedProduct && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Stock Actual</p>
                    <p className="font-bold text-slate-900">
                      {formatNumber(selectedProduct.stockCurrent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Costo Promedio</p>
                    <p className="font-bold text-slate-900">
                      {formatCurrency(selectedProduct.costPriceAvg)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Unidad Base</p>
                    <p className="font-bold text-slate-900">
                      {selectedProduct.baseUnit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Precio Unitario{" "}
                  {selectedProduct?.baseUnit
                    ? `(${selectedProduct.baseUnit})`
                    : ""}{" "}
                  *
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Observaciones
              </label>
              <textarea
                name="notes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Notas adicionales sobre la entrada"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 font-medium"
              >
                {loading ? "Registrando..." : "✅ Registrar Entrada"}
              </button>
              <Link
                href="/dashboard/movements/history"
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-300 rounded-lg hover:bg-slate-500 font-medium text-center"
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
          <p>
            • El costo promedio se actualizará automáticamente con la fórmula
            ponderada
          </p>
          <p>• Conserva la factura o remisión como comprobante</p>
          <p>• Si hay error, puedes registrar una salida correctiva</p>
        </CardContent>
      </Card>
    </div>
  );
}
