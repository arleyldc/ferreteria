/**
 * @file prisma/seed.ts
 * @description Seed the database with example data
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // ========================================================================
    // 1. Clear existing data (optional)
    // ========================================================================
    console.log("🗑️  Clearing existing data...");
    await prisma.auditLog.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.productPrice.deleteMany({});
    await prisma.unitConversion.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customerType.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // ========================================================================
    // 2. Create Users
    // ========================================================================
    console.log("👥 Creating users...");
    const adminPassword = await hashPassword("Admin123");
    const almacenistaPassword = await hashPassword("Alm123");
    const vendedorPassword = await hashPassword("Vend123");
    const clientePassword = await hashPassword("Cli123");

    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    const almacenista = await prisma.user.create({
      data: {
        email: "almacenista@example.com",
        name: "Juan Almacenista",
        password: almacenistaPassword,
        role: "ALMACENISTA",
        isActive: true,
      },
    });

    const vendedor = await prisma.user.create({
      data: {
        email: "vendedor@example.com",
        name: "Maria Vendedora",
        password: vendedorPassword,
        role: "VENDEDOR",
        isActive: true,
      },
    });

    const cliente = await prisma.user.create({
      data: {
        email: "cliente@example.com",
        name: "Cliente Demo",
        password: clientePassword,
        role: "CLIENTE",
        isActive: true,
      },
    });

    console.log("✅ Users created");

    // ========================================================================
    // 3. Create Categories
    // ========================================================================
    console.log("📂 Creating categories...");
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Clavos y Tornillos",
          description: "Clavos, tornillos y pernos de diferentes tamaños",
        },
      }),
      prisma.category.create({
        data: {
          name: "Herramientas Manuales",
          description: "Martillos, destornilladores, alicates, etc.",
        },
      }),
      prisma.category.create({
        data: {
          name: "Tubería y Accesorios",
          description: "Tuberías de PVC, cobre, y accesorios",
        },
      }),
      prisma.category.create({
        data: {
          name: "Materiales Eléctricos",
          description: "Cables, interruptores, tomas, etc.",
        },
      }),
      prisma.category.create({
        data: {
          name: "Pintura y Revestimientos",
          description: "Pinturas, barnices, esmaltes",
        },
      }),
    ]);

    console.log("✅ Categories created");

    // ========================================================================
    // 4. Create Customer Types
    // ========================================================================
    console.log("👤 Creating customer types...");
    const customerTypes = await Promise.all([
      prisma.customerType.create({ data: { name: "MINORISTA" } }),
      prisma.customerType.create({ data: { name: "MAYORISTA" } }),
      prisma.customerType.create({ data: { name: "CONSTRUCTOR" } }),
      prisma.customerType.create({ data: { name: "INSTITUCIONAL" } }),
    ]);

    console.log("✅ Customer types created");

    // ========================================================================
    // 5. Create Products
    // ========================================================================
    console.log("📦 Creating products...");
    const products = await Promise.all([
      // Clavos y Tornillos
      prisma.product.create({
        data: {
          code: "CLAV-2",
          name: "Clavo 2 pulgadas",
          description: "Clavo de acero galvanizado de 2 pulgadas",
          categoryId: categories[0].id,
          unitBase: "unidad",
          isFractionable: false,
          stockMin: 500,
          stockCurrent: 2000,
          costPriceAvg: 50,
          totalStockValue: 100000,
          location: "Estante A1",
          price: 100,
        },
      }),
      prisma.product.create({
        data: {
          code: "TORN-3X25",
          name: "Tornillo 3x25mm",
          description: "Tornillo de madera 3x25mm",
          categoryId: categories[0].id,
          unitBase: "unidad",
          isFractionable: false,
          stockMin: 1000,
          stockCurrent: 5000,
          costPriceAvg: 30,
          totalStockValue: 150000,
          location: "Estante A2",
          price: 100,
        },
      }),
      // Herramientas
      prisma.product.create({
        data: {
          code: "MARTI-16",
          name: "Martillo 16 oz",
          description: "Martillo de uña con mango de fibra de vidrio",
          categoryId: categories[1].id,
          unitBase: "unidad",
          isFractionable: false,
          stockMin: 5,
          stockCurrent: 20,
          costPriceAvg: 25000,
          totalStockValue: 500000,
          location: "Estante B1",
          price: 100,
        },
      }),
      // Tubería
      prisma.product.create({
        data: {
          code: "TUBO-PVC-50",
          name: "Tubería PVC 50mm",
          description: "Tubería PVC SAP 50mm 6m",
          categoryId: categories[2].id,
          unitBase: "metro",
          isFractionable: true,
          stockMin: 10,
          stockCurrent: 150,
          costPriceAvg: 8000,
          totalStockValue: 1200000,
          location: "Pasillo C1",
          price: 100,
        },
      }),
      // Materiales Eléctricos
      prisma.product.create({
        data: {
          code: "CABLE-2X14",
          name: "Cable 2x14 AWG",
          description: "Cable eléctrico 2x14 AWG",
          categoryId: categories[3].id,
          unitBase: "metro",
          isFractionable: true,
          stockMin: 50,
          stockCurrent: 500,
          costPriceAvg: 400,
          totalStockValue: 200000,
          location: "Pasillo D1",
          price: 100,
        },
      }),
      // Pintura
      prisma.product.create({
        data: {
          code: "PAINT-1L-BLA",
          name: "Pintura Blanca 1L",
          description: "Pintura latex blanca interior 1 litro",
          categoryId: categories[4].id,
          unitBase: "litro",
          isFractionable: true,
          stockMin: 5,
          stockCurrent: 50,
          costPriceAvg: 12000,
          totalStockValue: 600000,
          location: "Estante E1",
          price: 100,
        },
      }),
    ]);

    console.log("✅ Products created");

    // ========================================================================
    // 6. Create Unit Conversions
    // ========================================================================
    console.log("📐 Creating unit conversions...");
    await Promise.all([
      // Clavos por caja
      prisma.unitConversion.create({
        data: {
          productId: products[0].id,
          unitName: "caja",
          quantityInBase: 1000,
          isDefault: false,
        },
      }),
      // Tornillos por caja
      prisma.unitConversion.create({
        data: {
          productId: products[1].id,
          unitName: "caja",
          quantityInBase: 500,
          isDefault: false,
        },
      }),
      // Tubería por barra/tramo
      prisma.unitConversion.create({
        data: {
          productId: products[3].id,
          unitName: "tramo",
          quantityInBase: 6, // 1 tramo = 6 metros
          isDefault: false,
        },
      }),
      // Cable por rollo
      prisma.unitConversion.create({
        data: {
          productId: products[4].id,
          unitName: "rollo",
          quantityInBase: 100,
          isDefault: false,
        },
      }),
    ]);

    console.log("✅ Unit conversions created");

    // ========================================================================
    // 7. Create Product Prices by Customer Type
    // ========================================================================
    console.log("💰 Creating product prices...");
    for (const product of products) {
      // MINORISTA (mayor precio)
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          customerTypeId: customerTypes[0].id, // MINORISTA
          price: product.costPriceAvg * 1.5,
        },
      });

      // MAYORISTA (descuento)
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          customerTypeId: customerTypes[1].id, // MAYORISTA
          price: product.costPriceAvg * 1.2,
        },
      });

      // CONSTRUCTOR (descuento mayor)
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          customerTypeId: customerTypes[2].id, // CONSTRUCTOR
          price: product.costPriceAvg * 1.15,
        },
      });

      // INSTITUCIONAL (precio especial)
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          customerTypeId: customerTypes[3].id, // INSTITUCIONAL
          price: product.costPriceAvg * 1.1,
        },
      });
    }

    console.log("✅ Product prices created");

    // ========================================================================
    // 8. Create Initial Inventory Entries
    // ========================================================================
    console.log("📥 Creating initial inventory entries...");
    for (let i = 0; i < products.length; i++) {
      await prisma.inventoryMovement.create({
        data: {
          productId: products[i].id,
          type: "ENTRY",
          subType: "compra",
          quantity: products[i].stockCurrent,
          quantityInBase: products[i].stockCurrent,
          unitUsed: products[i].unitBase,
          unitPrice: products[i].costPriceAvg,
          documentNumber: `FACT-001-${String(i + 1).padStart(3, "0")}`,
          reason: "Inventario inicial",
          userId: admin.id,
        },
      });
    }

    console.log("✅ Initial inventory entries created");

    // ========================================================================
    // 9. Create Audit Logs
    // ========================================================================
    console.log("📝 Creating audit logs...");
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        actionType: "SYSTEM_INIT",
        details: {
          action: "Inicialización del sistema",
          productsCount: products.length,
          categoriesCount: categories.length,
          usersCount: 4,
        },
      },
    });

    console.log("✅ Audit logs created");

    // ========================================================================
    // Summary
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ Database seed completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   ✓ ${4} users created`);
    console.log(`   ✓ ${categories.length} categories created`);
    console.log(`   ✓ ${products.length} products created`);
    console.log(`   ✓ ${customerTypes.length} customer types created`);
    console.log("\n🔐 Credentials for testing:");
    console.log("   Admin:       admin@example.com / Admin123");
    console.log("   Almacenista: almacenista@example.com / Alm123");
    console.log("   Vendedor:    vendedor@example.com / Vend123");
    console.log("   Cliente:     cliente@example.com / Cli123");
    console.log("\n🚀 Start your app with: npm run dev");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
