import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { prisma } from "@/lib/prisma";

export type InventoryReportItem = {
  code: string;
  name: string;
  category: string;
  unitBase: string;
  stockCurrent: number;
  costPriceAvg: number;
  totalStockValue: number;
};

export async function fetchInventoryReportItems(): Promise<
  InventoryReportItem[]
> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { code: "asc" },
  });

  return products.map((product) => ({
    code: product.code,
    name: product.name,
    category: product.category.name,
    unitBase: product.unitBase,
    stockCurrent: product.stockCurrent,
    costPriceAvg: product.costPriceAvg,
    totalStockValue: product.totalStockValue,
  }));
}

export async function createInventoryExcelBuffer(
  items: InventoryReportItem[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inventario");

  worksheet.columns = [
    { header: "Código", key: "code", width: 14 },
    { header: "Producto", key: "name", width: 36 },
    { header: "Categoría", key: "category", width: 22 },
    { header: "Unidad", key: "unitBase", width: 14 },
    { header: "Stock", key: "stockCurrent", width: 12 },
    { header: "Costo Promedio", key: "costPriceAvg", width: 16 },
    { header: "Valor Total", key: "totalStockValue", width: 16 },
  ];

  worksheet.getRow(1).font = { bold: true };

  items.forEach((item) => {
    worksheet.addRow({
      code: item.code,
      name: item.name,
      category: item.category,
      unitBase: item.unitBase,
      stockCurrent: item.stockCurrent,
      costPriceAvg: item.costPriceAvg,
      totalStockValue: item.totalStockValue,
    });
  });

  worksheet.eachRow((row, index) => {
    row.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    if (index === 1) {
      row.alignment = { vertical: "middle", horizontal: "center" };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function createInventoryPdfBuffer(
  items: InventoryReportItem[],
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageSize = { width: 595.28, height: 841.89 };
  let page = pdfDoc.addPage([pageSize.width, pageSize.height]);
  let y = pageSize.height - 60;

  const margin = 40;
  const rowHeight = 18;
  const columns = [70, 160, 100, 50, 50, 60, 60];
  const headers = [
    "Código",
    "Producto",
    "Categoría",
    "Unidad",
    "Stock",
    "Costo",
    "Valor",
  ];

  const drawHeader = () => {
    let x = margin;
    page.drawText("Reporte de Inventario", {
      x: margin,
      y,
      size: 18,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 30;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x,
        y,
        size: 9,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      x += columns[index];
    });
    y -= rowHeight;
  };

  const addPage = () => {
    page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    y = pageSize.height - 60;
    drawHeader();
  };

  drawHeader();

  items.forEach((item) => {
    if (y < 80) {
      addPage();
    }

    const values = [
      item.code,
      item.name,
      item.category,
      item.unitBase,
      item.stockCurrent.toString(),
      item.costPriceAvg.toFixed(2),
      item.totalStockValue.toFixed(2),
    ];

    let x = margin;
    values.forEach((value, index) => {
      page.drawText(value, {
        x,
        y,
        size: 8,
        font: index === 1 ? helvetica : helvetica,
        color: rgb(0, 0, 0),
      });
      x += columns[index];
    });

    y -= rowHeight;
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
