"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserEditDialog } from "./UserEditDialog";
import { UserDeleteButton } from "./UserDeleteButton";
import { getAllUsers } from "@/actions/user.actions";
import { toast } from "sonner";
import { UserActiveButton } from "./UserActiveButton";

/**
 * Users management page (dark UI)
 */
export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);

    const result = await getAllUsers();

    if (result.success) {
      setUsers(result.users || []);
    } else {
      toast.error(result.error || "Error al cargar usuarios");
    }

    setIsLoading(false);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "👨‍💼 Administrador",
      ALMACENISTA: "📦 Almacenista",
      VENDEDOR: "🛍️ Vendedor",
      CLIENTE: "👤 Cliente",
    };

    return labels[role] || role;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-300">
          Activo
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-300">
        Inactivo
      </span>
    );
  };
  console.log(users);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">👥 Usuarios</h1>

          <p className="text-slate-400 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>

        <a
          href="/register"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium inline-block"
        >
          + Nuevo Cliente
        </a>
      </div>

      {/* TABLE CARD */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Usuarios Registrados</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* HEADER */}
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>

                    <th className="text-left py-3 px-4 font-medium">Email</th>

                    <th className="text-left py-3 px-4 font-medium">Rol</th>

                    <th className="text-center py-3 px-4 font-medium">
                      Estado
                    </th>

                    <th className="text-center py-3 px-4 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {users.map((user: any) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition-all duration-200 group"
                    >
                      {/* NOMBRE */}
                      <td className="py-3 px-4 font-medium text-slate-200 transition-all duration-200 group-hover:text-blue-400">
                        {user.name}
                      </td>

                      {/* EMAIL */}
                      <td className="py-3 px-4 text-slate-500 text-sm transition-all duration-200 group-hover:text-blue-400">
                        {user.email}
                      </td>

                      {/* ROL */}
                      <td className="py-3 px-4 text-slate-400 text-sm transition-all duration-200 group-hover:text-blue-400">
                        {getRoleLabel(user.role)}
                      </td>

                      {/* ESTADO */}
                      <td className="py-3 px-4 text-center transition-all duration-200 group-hover:scale-105">
                        {getStatusBadge(user.isActive)}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3 px-4 text-center space-x-2">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition">
                          <UserEditDialog
                            user={user}
                            onSuccess={loadUsers}
                            disabled={user.role === "CLIENTE"}
                          />

                          {user.isActive ? (
                            <UserDeleteButton
                              userId={user.id}
                              onSuccess={loadUsers}
                            />
                          ) : (
                            <UserActiveButton
                              userId={user.id}
                              onSuccess={loadUsers}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay usuarios creados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
