import {
  createInventoryPdfBuffer,
  fetchInventoryReportItems,
} from "@/lib/export-report";

export async function GET() {
  const items = await fetchInventoryReportItems();
  const buffer = await createInventoryPdfBuffer(items);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-inventario.pdf"',
    },
  });
}
