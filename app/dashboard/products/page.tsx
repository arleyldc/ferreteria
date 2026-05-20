import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

/**
 * Products management page (dark dashboard style)
 */
export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: { movements: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const stats = {
    total: products.length,
    totalValue: products.reduce(
      (acc, p) => acc + p.stockCurrent * p.costPriceAvg,
      0,
    ),
    lowStock: products.filter((p) => p.stockCurrent <= p.stockMin).length,
    outOfStock: products.filter((p) => p.stockCurrent === 0).length,
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) {
      return {
        label: "Agotado",
        emoji: "🔴",
        color: "bg-red-500/20 text-red-400",
      };
    }
    if (current <= minimum) {
      return {
        label: "Bajo",
        emoji: "🟡",
        color: "bg-yellow-500/20 text-yellow-300",
      };
    }
    return {
      label: "OK",
      emoji: "🟢",
      color: "bg-green-500/20 text-green-300",
    };
  };

  const categoryColors: Record<string, string> = {
    Clavos: "text-orange-300",
    Herramientas: "text-blue-300",
    Tubería: "text-cyan-300",
    Eléctricos: "text-yellow-300",
    Pintura: "text-purple-300",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📦 Productos</h1>
          <p className="text-slate-400 mt-1">
            Gestiona el catálogo de productos
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Total Productos</p>
            <p className="text-3xl font-bold text-slate-200 mt-1">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Valor Total</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {formatCurrency(stats.totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Bajo Stock</p>
            <p className="text-3xl font-bold text-yellow-300 mt-1">
              {stats.lowStock}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Agotados</p>
            <p className="text-3xl font-bold text-red-400 mt-1">
              {stats.outOfStock}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">
            Catálogo de Productos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-3 px-4 font-medium">Código</th>
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium">Categoría</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-right py-3 px-4 font-medium">Costo</th>
                  <th className="text-right py-3 px-4 font-medium">Valor</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {products.map((product: any) => {
                  const status = getStockStatus(
                    product.stockCurrent,
                    product.minimumStock,
                  );

                  const totalValue =
                    product.stockCurrent * product.costPriceAvg;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-300 group-hover:text-blue-400 transition">
                        {product.code}
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/products/edit/${product.id}`}
                          className="font-medium text-slate-200 hover:text-blue-400 transition"
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td
                        className={`py-3 px-4 ${
                          categoryColors[product.category.name] ||
                          "text-slate-400"
                        }`}
                      >
                        {product.category.name}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 group-hover:text-blue-400 transition">
                        {formatNumber(product.stockCurrent)} {product.baseUnit}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${status.color}`}
                        >
                          {status.emoji} {status.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300 group-hover:text-blue-400 transition">
                        {formatCurrency(product.costPriceAvg)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-green-400 group-hover:text-blue-400 transition">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="py-3 px-4 text-center space-x-2">
                        <Link
                          href={`/dashboard/products/edit/${product.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                        >
                          Editar / Eliminar
                        </Link>

                        {/* <button className="text-red-400 hover:text-red-300 font-medium text-sm">
                          Eliminar
                        </button> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay productos creados.
              <Link
                href="/dashboard/products/new"
                className="text-blue-400 hover:underline ml-2"
              >
                Crear el primero
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
