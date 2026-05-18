import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Categories management page (dark UI)
 */
export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏷️ Categorías</h1>
          <p className="text-slate-400 mt-1">
            Gestiona las categorías de productos
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium">
          + Nueva Categoría
        </button>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">
            Categorías Registradas
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* HEADER */}
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Descripción
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Productos
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {categories.map((cat: any) => (
                  <tr
                    key={cat.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-200 group-hover:text-blue-400 transition">
                      {cat.name}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-sm group-hover:text-blue-400 transition">
                      {cat.description || "-"}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300">
                        {cat._count.products}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                        Editar
                      </button>

                      <button className="text-red-400 hover:text-red-300 font-medium text-sm">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay categorías creadas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
