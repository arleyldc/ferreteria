import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, convertUnits } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      unitConversions: true,
      productPrices: {
        include: { customerType: true },
      },
      movements: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: true },
      },
    },
  });

  if (!product) {
    redirect("/inventory");
  }

  const totalValue = product.stockCurrent * product.costPriceAvg;
  const recentMovements = product.movements;

  // Calcular cambios promedio de stock
  const lastMonthMovements = recentMovements.filter(
    (m) =>
      new Date(m.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) {
      return {
        label: "Agotado",
        color: "bg-red-100 text-red-700",
        emoji: "🔴",
      };
    }
    if (current <= minimum) {
      return {
        label: "Bajo Stock",
        color: "bg-yellow-100 text-yellow-700",
        emoji: "🟡",
      };
    }
    return {
      label: "Stock OK",
      color: "bg-green-100 text-green-700",
      emoji: "🟢",
    };
  };

  const statusInfo = getStockStatus(product.stockCurrent, product.stockMin);
  const prices = product.productPrices as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-slate-600 mt-1">Código: {product.code}</p>
        </div>
        <div className="text-right">
          <div
            className={`inline-block px-3 py-2 rounded-lg font-bold ${statusInfo.color}`}
          >
            {statusInfo.emoji} {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Stock Actual</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {formatNumber(product.stockCurrent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Stock Mínimo</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {formatNumber(product.stockMin)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Costo Promedio</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {formatCurrency(product.costPriceAvg)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Valor Total</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Product Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-bold">
                  Categoría
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.category.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600 uppercase font-bold">
                  Descripción
                </p>
                <p className="text-sm text-slate-900 mt-1">
                  {product.description || "-"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 uppercase font-bold">
                  Unidad Base
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.unitBase}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600 uppercase font-bold">
                  Permitir Fracciones
                </p>
                <p className="text-sm mt-1">
                  {product.isFractionable ? "✅ Sí" : "❌ No"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Conversiones</CardTitle>
            </CardHeader>
            <CardContent>
              {product.unitConversions.length > 0 ? (
                <div className="space-y-3">
                  {product.unitConversions.map((conv: any) => (
                    <div key={conv.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-bold text-slate-900">
                        1 {conv.alternativeUnit}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        = {conv.conversionFactor} {product.unitBase}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay conversiones registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Precios por Cliente */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Precios por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {prices.length > 0 ? (
                <div className="space-y-3">
                  {prices.map((price: any) => {
                    const margin =
                      ((price.price - product.costPriceAvg) /
                        product.costPriceAvg) *
                      100;
                    return (
                      <div
                        key={price.id}
                        className="p-3 bg-slate-50 rounded-lg"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {price.customerType.name}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-600">
                            {formatCurrency(price.price)}
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            +{margin.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay precios configurados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Movements History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Cantidad
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Stock Resultante
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Documento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((movement: any) => {
                    const isEntry = movement.movementType === "ENTRY";
                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 text-xs">
                          {new Date(movement.createdAt).toLocaleDateString(
                            "es-CO",
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                              isEntry
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isEntry ? "📥 ENTRADA" : "📤 SALIDA"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatNumber(movement.quantityBase)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatNumber(movement.resultingStock)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {movement.user.name}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {movement.documentNumber || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No hay movimientos registrados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad (Últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Movimientos Totales</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {lastMonthMovements.length}
              </p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Entradas</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {lastMonthMovements.filter((m) => m.type === "ENTRY").length}
              </p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Salidas</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {lastMonthMovements.filter((m) => m.type === "EXIT").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
