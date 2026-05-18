import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

/**
 * Dashboard layout with sidebar and navigation
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as Role;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
      roles: ["ADMIN", "ALMACENISTA", "VENDEDOR"],
    },
    {
      label: "Inventario",
      href: "/dashboard/inventory",
      icon: "📦",
      roles: ["ADMIN", "ALMACENISTA", "VENDEDOR"],
    },
    {
      label: "Productos",
      href: "/dashboard/products",
      icon: "🏷️",
      roles: ["ADMIN", "ALMACENISTA"],
    },
    {
      label: "Movimientos",
      href: "/dashboard/movements/history",
      icon: "🔄",
      roles: ["ADMIN", "ALMACENISTA"],
    },
    {
      label: "Entrada",
      href: "/dashboard/movements/entry",
      icon: "📥",
      roles: ["ADMIN", "ALMACENISTA"],
    },
    {
      label: "Salida",
      href: "/dashboard/movements/exit",
      icon: "📤",
      roles: ["ADMIN", "ALMACENISTA"],
    },
    {
      label: "Punto de Venta",
      href: "/dashboard/pos",
      icon: "💳",
      roles: ["ADMIN", "ALMACENISTA", "VENDEDOR"],
    },
    {
      label: "Reportes",
      href: "/dashboard/reports",
      icon: "📈",
      roles: ["ADMIN", "ALMACENISTA"],
    },
    {
      label: "Auditoría",
      href: "/dashboard/audit",
      icon: "🔐",
      roles: ["ADMIN"],
    },
    {
      label: "Configuración",
      href: "/dashboard/settings/categories",
      icon: "⚙️",
      roles: ["ADMIN"],
    },
    {
      label: "Usuarios",
      href: "/dashboard/settings/users",
      icon: "👥",
      roles: ["ADMIN"],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-slate-950 px-6 py-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold">
            MORIKAWA <br />
            <span className="text-green-400">FERRE+</span>
          </h1>
        </div>

        <nav className="p-4">
          {filteredNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg mb-2 hover:bg-slate-800 text-slate-100"
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <p className="text-slate-400 text-sm">Usuario:</p>
          <p className="text-white font-medium truncate">
            {session.user?.name}
          </p>
          <p className="text-xs text-slate-500">{userRole}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-3 flex justify-between">
          <h2 className="text-xl font-semibold">Gestión de Inventario</h2>

          <form action="/api/auth/signout" method="post">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Cerrar sesión
            </button>
          </form>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
