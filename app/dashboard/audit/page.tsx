import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Audit log page - Admin only (dark UI)
 */
export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🔐 Auditoría</h1>
        <p className="text-slate-400 mt-1">
          Registro de todos los eventos del sistema
        </p>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">
            Registro de Auditoría
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium">Acción</th>
                  <th className="text-left py-3 px-4 font-medium">Detalles</th>
                  <th className="text-left py-3 px-4 font-medium">IP</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap group-hover:text-blue-400 transition">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 group-hover:text-blue-400 transition">
                        {log.user.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.user.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                        {log.actionType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate group-hover:text-blue-400 transition">
                      {JSON.stringify(log.details).substring(0, 60)}...
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-500 group-hover:text-blue-400 transition">
                      {log.ipAddress || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay registros de auditoría
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
