import {
  createInventoryExcelBuffer,
  fetchInventoryReportItems,
} from "@/lib/export-report";

export async function GET() {
  const items = await fetchInventoryReportItems();
  const buffer = await createInventoryExcelBuffer(items);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="reporte-inventario.xlsx"',
    },
  });
}
