import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

/**
 * Prices management page - Configure pricing by customer type
 */
export default async function PricesPage() {
  const prices = await prisma.productPrice.findMany({
    include: {
      customerType: true,
      product: {
        select: {
          id: true,
          code: true,
          name: true,
          costPriceAvg: true,
        },
      },
    },
    orderBy: [{ product: { name: "asc" } }, { customerType: { name: "asc" } }],
    take: 100,
  });

  const getCustomerTypeEmoji = (name: string) => {
    const emojis: Record<string, string> = {
      MINORISTA: "🛒",
      MAYORISTA: "📦",
      CONSTRUCTOR: "👷",
      INSTITUCIONAL: "🏢",
    };
    return emojis[name] || "💼";
  };

  const calculateMargin = (cost: number, price: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          💰 Gestión de Precios
        </h1>
        <p className="text-slate-600 mt-1">
          Configura los precios por tipo de cliente
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {new Set(prices.map((p) => p.product.id)).size}
              </p>
              <p className="text-sm text-slate-600 mt-2">Productos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {new Set(prices.map((p) => p.customerTypeId)).size}
              </p>
              <p className="text-sm text-slate-600 mt-2">Tipos Cliente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {prices.length}
              </p>
              <p className="text-sm text-slate-600 mt-2">Configuraciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {prices.length > 0
                  ? (
                      prices.reduce(
                        (acc, p) => acc + (p.price - p.product.costPriceAvg),
                        0,
                      ) / prices.length
                    ).toFixed(0)
                  : "0"}
              </p>
              <p className="text-sm text-slate-600 mt-2">Margen Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Precios por Producto</CardTitle>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            ⚙️ Configurar
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold">
                    Producto
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                  <th className="text-right py-3 px-4 font-semibold">Costo</th>
                  <th className="text-right py-3 px-4 font-semibold">Precio</th>
                  <th className="text-right py-3 px-4 font-semibold">Margen</th>
                  <th className="text-center py-3 px-4 font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price: any) => {
                  const margin = calculateMargin(
                    price.product.costPriceAvg,
                    price.price,
                  );
                  return (
                    <tr
                      key={price.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {price.product.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Cod: {price.product.code}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {getCustomerTypeEmoji(price.customerType.name)}{" "}
                          {price.customerType.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(price.product.costPriceAvg)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        {formatCurrency(price.price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            margin >= 30
                              ? "bg-green-100 text-green-700"
                              : margin >= 15
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          +{margin.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {prices.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay precios configurados
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                name: "MINORISTA",
                desc: "Comprador individual",
                emoji: "🛒",
                markup: 50,
              },
              {
                name: "MAYORISTA",
                desc: "Compra en volumen",
                emoji: "📦",
                markup: 20,
              },
              {
                name: "CONSTRUCTOR",
                desc: "Proyectos grandes",
                emoji: "👷",
                markup: 15,
              },
              {
                name: "INSTITUCIONAL",
                desc: "Gobiernos/empresas",
                emoji: "🏢",
                markup: 10,
              },
            ].map((ct, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">{ct.emoji}</div>
                <h3 className="font-bold text-slate-900">{ct.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{ct.desc}</p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-sm font-bold text-green-600">
                    Margen: +{ct.markup}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
