import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dashboard home page (UI polish: contrast + floating icons)
 */
export default async function DashboardPage() {
  const lowStockProductsRaw = await prisma.$queryRaw<
    Array<{
      id: string;
      code: string;
      name: string;
      stockCurrent: number;
      stockMin: number;
      unitBase: string;
    }>
  >`
    SELECT
      id,
      code,
      name,
      "stockCurrent",
      "stockMin",
      "unitBase"
    FROM products
    WHERE "stockCurrent" <= "stockMin"
    ORDER BY "stockCurrent" ASC
    LIMIT 10
  `;

  const lowStockCountRaw = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM products
    WHERE "stockCurrent" <= "stockMin"
  `;

  const [productsCount, totalValue, recentMovements, topProducts] =
    await Promise.all([
      prisma.product.count(),

      prisma.product.aggregate({
        _sum: { totalStockValue: true },
      }),

      prisma.inventoryMovement.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, code: true } },
          user: { select: { name: true } },
        },
      }),

      prisma.product.findMany({
        take: 10,
        orderBy: { totalStockValue: "desc" },
        select: {
          id: true,
          code: true,
          name: true,
          stockCurrent: true,
          totalStockValue: true,
          unitBase: true,
        },
      }),
    ]);

  const totalStockValue = totalValue._sum.totalStockValue || 0;
  const lowStockCount = Number(lowStockCountRaw[0]?.count || 0);

  const cardClass =
    "rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md hover:scale-[1.01] transition dark:from-slate-900 dark:to-slate-800 dark:border-slate-800";

  return (
    <div className="space-y-8 bg-slate-50/40 p-6 rounded-2xl">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Productos */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Productos
            </CardTitle>
            <div className="text-2xl animate-float">📦</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-sm text-slate-300">Total en sistema</p>
          </CardContent>
        </Card>

        {/* Valor inventario */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Valor Inventario
            </CardTitle>
            <div className="text-2xl animate-float">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStockValue)}
            </div>
            <p className="text-sm text-slate-300">Costo total</p>
          </CardContent>
        </Card>

        {/* Stock bajo */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Stock Bajo
            </CardTitle>
            <div className="text-2xl animate-bounce-slow text-red-500">⚠️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {lowStockCount}
            </div>
            <p className="text-sm text-slate-300">Bajo mínimo</p>
          </CardContent>
        </Card>

        {/* Movimientos */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Movimientos
            </CardTitle>
            <div className="text-2xl animate-float">🔄</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMovements.length}</div>
            <p className="text-sm text-slate-300">Últimos movimientos</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ALERTAS */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">
              ⚠️ Alertas de Stock Bajo
            </CardTitle>
          </CardHeader>

          <CardContent>
            {lowStockProductsRaw.length > 0 ? (
              <div className="space-y-3">
                {lowStockProductsRaw.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {product.code} - {product.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        Stock: {formatNumber(product.stockCurrent)}{" "}
                        {product.unitBase} · Mín:{" "}
                        {formatNumber(product.stockMin)}
                      </div>
                    </div>

                    <a
                      href={`/dashboard/inventory/${product.id}`}
                      className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 shadow-sm"
                    >
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                ✓ Todo en orden
              </div>
            )}
          </CardContent>
        </Card>

        {/* MOVIMIENTOS */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">
              🔄 Últimos Movimientos
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((mov) => (
                <div key={mov.id} className="border-b pb-2">
                  <div className="font-medium text-slate-300">
                    {mov.product.code}
                  </div>
                  <div className="text-xs text-slate-500">
                    {mov.type}: {formatNumber(mov.quantityInBase)}{" "}
                    {mov.unitUsed}
                  </div>
                  <div className="text-xs text-slate-300">
                    {mov.user.name} ·{" "}
                    {new Date(mov.createdAt).toLocaleDateString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP PRODUCTS */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">
            Top 10 Productos por Valor
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-300">
                  <th className="py-2 text-left">Código</th>
                  <th className="py-2 text-left">Producto</th>
                  <th className="py-2 text-right">Stock</th>
                  <th className="py-2 text-right">Valor</th>
                </tr>
              </thead>

              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-slate-500">
                    <td className="py-2 font-mono text-xs">{p.code}</td>
                    <td className="text-slate-300">{p.name}</td>
                    <td className="text-right">
                      {formatNumber(p.stockCurrent)} {p.unitBase}
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(p.totalStockValue || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
