"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Reports page
 */
export default function ReportsPage() {
  const downloadPdf = () => {
    window.open("/api/export/pdf", "_blank", "noopener,noreferrer");
  };

  const downloadExcel = () => {
    window.open("/api/export/excel", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📈 Reportes</h1>
        <p className="text-slate-600 mt-1">
          Generar y descargar reportes de inventario
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportar inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 py-8">
          <p className="text-slate-500">
            Descarga el inventario actual en PDF o Excel con los productos,
            categorías, stock y valores.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={downloadPdf}>Descargar PDF</Button>
            <Button variant="secondary" onClick={downloadExcel}>
              Descargar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
