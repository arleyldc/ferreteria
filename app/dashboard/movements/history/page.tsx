import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Movements history page (dark UI consistent)
 */
export default async function MovementsHistoryPage() {
  const movements = await prisma.inventoryMovement.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { code: true, name: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          🔄 Historial de Movimientos
        </h1>
        <p className="text-slate-400 mt-1">
          Registro de todas las operaciones de inventario
        </p>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Últimos Movimientos</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-center py-3 px-4 font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Documento</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {movements.map((mov) => (
                  <tr
                    key={mov.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-3 px-4 text-slate-400 group-hover:text-blue-400 transition">
                      {formatDate(mov.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 group-hover:text-blue-400 transition">
                        {mov.product.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        {mov.product.name}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          mov.type === "ENTRY"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {mov.type === "ENTRY" ? "ENTRADA" : "SALIDA"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-300 group-hover:text-blue-400 transition">
                      {formatNumber(mov.quantityInBase)} {mov.unitUsed}
                    </td>

                    <td className="py-3 px-4 text-slate-400 group-hover:text-blue-400 transition">
                      {mov.user.name}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-500 group-hover:text-blue-400 transition">
                      {mov.documentNumber || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movements.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay movimientos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
