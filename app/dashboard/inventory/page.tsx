import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber, getStockStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Inventory view with list of products
 */
export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { label: "Agotado", color: "bg-red-600" };
    if (current <= min) return { label: "Bajo", color: "bg-yellow-500" };
    return { label: "OK", color: "bg-green-600" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📦 Inventario</h1>
        <p className="text-slate-600 mt-1">
          {products.length} productos en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">
            Lista de Productos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER — estilo igual al Top 10 */}
              <thead>
                <tr className="border-b text-slate-300">
                  <th className="py-2 text-left font-medium">Código</th>
                  <th className="py-2 text-left font-medium">Producto</th>
                  <th className="py-2 text-left font-medium">Categoría</th>
                  <th className="py-2 text-right font-medium">Stock Actual</th>
                  <th className="py-2 text-right font-medium">Mínimo</th>
                  <th className="py-2 text-center font-medium">Estado</th>
                  <th className="py-2 text-right font-medium">
                    Costo Promedio
                  </th>
                  <th className="py-2 text-right font-medium">Valor Total</th>
                  <th className="py-2 text-center font-medium">Acción</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(
                    product.stockCurrent,
                    product.stockMin,
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-700/40 hover:bg-slate-700/40 transition group"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-300 group-hover:text-blue-400 transition">
                        {product.code}
                      </td>

                      <td className="py-3 px-4 group-hover:text-blue-400 transition">
                        <div className="font-medium text-slate-300">
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {product.description.substring(0, 40)}...
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 group-hover:text-blue-400 transition">
                        {product.category.name}
                      </td>

                      <td className="py-3 px-4 text-right group-hover:text-blue-400 transition">
                        <span className="font-medium text-slate-300">
                          {formatNumber(product.stockCurrent)}
                        </span>
                        <span className="text-slate-500 ml-1">
                          {product.unitBase}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400 group-hover:text-blue-400 transition">
                        {product.stockMin}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span
                            className={`${status.color} text-white text-xs font-bold px-2 py-1 rounded`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 group-hover:text-blue-400 transition">
                        {formatCurrency(product.costPriceAvg)}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-300 group-hover:text-blue-400 transition">
                        {formatCurrency(product.totalStockValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <a
                          href={`/dashboard/inventory/${product.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                        >
                          Ver
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay productos en el sistema
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
