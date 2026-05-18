# MORIKAWA FERRE+ - Sistema de Gestión de Inventario 🏢

Sistema completo de gestión de inventario para ferreterías, construido con **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma ORM** y **PostgreSQL**.

## 📋 Requisitos Previos

- **Node.js** 18+
- **npm** o **yarn**
- **PostgreSQL** 12+
- **Git**

## 🚀 Instalación Rápida

### 1. Clonar el proyecto

```bash
git clone <repository-url>
cd Ferreteria
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```bash
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/ferreteria"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-segura-de-32-caracteres-aqui"

# Email (Opcional para alertas)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-contraseña-app-google"
SMTP_FROM_EMAIL="soporte@morikawaferre.com"

# Node Environment
NODE_ENV="development"
```

#### Generar NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 4. Preparar la base de datos

```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Seedear datos de ejemplo (categorías, tipos de cliente, admin)
npx prisma db seed
```

### 5. Iniciar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 🔐 Credenciales de Ejemplo

Después de ejecutar el seed, puedes acceder con:

- **Email**: `admin@example.com`
- **Contraseña**: `Admin123`

### Usuarios de Ejemplo

| Email                   | Password | Rol         |
| ----------------------- | -------- | ----------- |
| admin@example.com       | Admin123 | ADMIN       |
| almacenista@example.com | Alm123   | ALMACENISTA |
| vendedor@example.com    | Vend123  | VENDEDOR    |

## 📁 Estructura del Proyecto

```
Ferreteria/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ ├── register/
│ ├── (dashboard)/
│ │ ├── layout.tsx (Sidebar, navegación)
│ │ ├── page.tsx (Dashboard principal)
│ │ ├── inventory/
│ │ ├── products/
│ │ ├── movements/
│ │ ├── pos/
│ │ ├── reports/
│ │ ├── audit/
│ │ └── settings/
│ ├── api/
│ │ ├── auth/[...nextauth]/
│ │ └── ...
│ └── layout.tsx
├── actions/ (Server Actions)
│ ├── product.actions.ts
│ ├── movement.actions.ts ⭐ (Lógica de costo promedio)
│ ├── sale.actions.ts
│ └── ...
├── components/
│ ├── ui/ (Componentes base)
│ ├── forms/ (Formularios)
│ ├── dashboard/ (Componentes dashboard)
│ └── pos/ (Componentes POS)
├── lib/
│ ├── env.ts (Validación de variables)
│ ├── auth.ts (Configuración NextAuth)
│ ├── prisma.ts (Cliente Prisma)
│ ├── utils.ts (Funciones utilitarias)
│ └── validations/ (Zod schemas)
├── types/
│ └── index.ts (Type definitions)
├── prisma/
│ ├── schema.prisma (Modelos de BD)
│ ├── seed.ts (Datos de ejemplo)
│ └── migrations/
├── middleware.ts (Protección de rutas)
└── README.md (Este archivo)
```

## 🎯 Características Principales

### 1. **Gestión de Productos** ✅

- Crear/editar/eliminar productos
- Código único auto-generado o manual
- Múltiples unidades de medida con conversiones
- Productos fraccionables (decimales)
- Ubicación en almacén
- Stock mínimo para alertas

### 2. **Entrada de Mercancía** ✅

- Registrar compras a proveedores
- Cálculo automático de **costo promedio ponderado**
- Generación de comprobante automático
- Actualización automática de stock

### 3. **Salida de Mercancía** ✅

- Tipos de salida: venta, merma, ajuste, traslado
- Validación automática de stock disponible
- Soporte para productos fraccionables
- Descuento automático del inventario

### 4. **Consulta de Stock** ✅

- Vista principal con tabla de productos
- Filtros por categoría, rango de stock
- Indicador visual de estado (verde/amarillo/rojo)
- Valor total del inventario
- Historial de movimientos por producto

### 5. **Alertas de Stock Mínimo** ✅

- Panel de alertas en dashboard
- Productos por debajo del mínimo resaltados
- Sugerencia de cantidad para reabastecer

### 6. **Punto de Venta (POS)** ✅

- Búsqueda rápida de productos
- Carrito de compras
- Precios diferenciados por tipo de cliente
- Métodos de pago: efectivo, tarjeta, transferencia
- Generación de ticket

### 7. **Precios Diferenciados** ✅

- Tipos de cliente: MINORISTA, MAYORISTA, CONSTRUCTOR
- Precios configurables por tipo de cliente
- Aplicación automática en POS

### 8. **Auditoría y Seguridad** ✅

- Log de todas las acciones (CREATE, UPDATE, DELETE, STOCK_ENTRY, etc.)
- Registro de usuario y IP
- Control de acceso por roles
- Rutas protegidas con middleware

### 9. **Roles y Permisos** ✅

- **ADMIN**: Acceso total, gestión de usuarios, configuración
- **ALMACENISTA**: Entrada/salida de mercancía, consulta de stock
- **VENDEDOR**: Punto de venta y consulta de stock

### 10. **Dashboard con KPIs** ✅

- Cantidad total de productos
- Valor total del inventario
- Productos bajo mínimo
- Top 10 productos por valor
- Últimos movimientos

## 🔧 Funcionalidades Técnicas Clave

### Cálculo de Costo Promedio Ponderado

Esta es la **función crítica** del sistema, implementada en `actions/movement.actions.ts`:

```typescript
// Fórmula: newCostoPromedio = ((stockActual × costoPromedioAnterior) + (cantidadNueva × costoNuevo)) / (stockActual + cantidadNueva)

const newCostPriceAvg = calculateWeightedAverageCost(
  product.stockCurrent,
  product.costPriceAvg,
  quantityInBase,
  validated.unitPrice,
);
```

Esto asegura que el precio de costo siempre refleje el valor promedio de todo el inventario.

### Conversión de Unidades

Los productos pueden tener múltiples unidades de medida:

- **Ejemplo**: 1 caja de clavos = 1000 unidades
- Las conversiones se almacenan en `UnitConversion`
- Todas las operaciones se convierten a unidad base internamente

### Transacciones Seguras

Todas las operaciones críticas usan transacciones Prisma:

```typescript
await prisma.$transaction([
  // Crear movimiento
  prisma.inventoryMovement.create(...),
  // Actualizar producto
  prisma.product.update(...),
  // Registrar auditoría
  prisma.auditLog.create(...),
])
```

## 📊 Modelos de Base de Datos

### User

```prisma
model User {
  id String @id @default(cuid())
  email String @unique
  password String (bcrypt)
  role Role (ADMIN, ALMACENISTA, VENDEDOR)
}
```

### Product

```prisma
model Product {
  code String @unique
  name String
  categoryId String
  unitBase String
  stockCurrent Float (siempre en unidad base)
  costPriceAvg Float (costo promedio ponderado)
  totalStockValue Float (stockCurrent × costPriceAvg)
  stockMin Int (para alertas)
}
```

### InventoryMovement (CRITICAL)

```prisma
model InventoryMovement {
  type MovementType (ENTRY, EXIT)
  subType String (compra, venta, merma, etc.)
  quantity Float
  quantityInBase Float (convertido a unidad base)
  unitPrice Float (costo o precio de venta)
}
```

Ver [prisma/schema.prisma](./prisma/schema.prisma) para el schema completo.

## 🚢 Despliegue a Producción

### Generar NEXTAUTH_SECRET seguro:

```bash
openssl rand -base64 32
```

### Con Vercel:

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... etc
vercel deploy
```

### Con Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Server Actions

### Movimientos de Inventario

```typescript
import { recordStockEntry, recordStockExit } from "@/actions/movement.actions";

// Entrada de mercancía
const result = await recordStockEntry({
  productId: "prod-123",
  quantity: 100,
  unitUsed: "caja",
  unitPrice: 5000,
  documentNumber: "FACT-001",
  reason: "Compra a proveedor",
});

// Salida de mercancía
const result = await recordStockExit({
  productId: "prod-123",
  quantity: 10,
  unitUsed: "unidad",
  subType: "venta",
  reason: "Venta cliente",
});
```

### Productos

```typescript
import { createProduct, getProductDetail } from "@/actions/product.actions";

const result = await createProduct({
  code: "CLAV-2-100",
  name: 'Clavo 2"',
  categoryId: "cat-123",
  unitBase: "unidad",
  isFractionable: false,
  stockMin: 100,
});
```

### Ventas POS

```typescript
import { createSale } from "@/actions/sale.actions";

const result = await createSale({
  customerTypeId: "minorista",
  items: [{ productId: "prod-123", quantity: 5, unitPrice: 1500 }],
  discount: 500,
  paymentMethod: "cash",
});
```

## 🐛 Troubleshooting

### Error: "P2002 Unique constraint failed"

- El código del producto ya existe
- Solución: Utiliza `generateProductCode()` para generar códigos únicos

### Error: "Insufficient stock"

- No hay suficiente stock para la salida
- Solución: Verifica el inventario disponible antes de la operación

### Error de conexión a PostgreSQL

- Verifica que PostgreSQL esté corriendo
- Verifica `DATABASE_URL` en `.env.local`
- Verifica credenciales de acceso

### Error en autenticación

- Limpia cookies del navegador
- Verifica `NEXTAUTH_SECRET` tenga 32+ caracteres
- Verifica `NEXTAUTH_URL` correcto

## 📞 Soporte

Para reportar issues o sugerencias:

- GitHub Issues: [Crear issue]
- Email: soporte@morikawaferre.com

## 📄 Licencia

Propiedad de MORIKAWA FERRE+

## ⚡ Próximos Desarrollos

- [ ] Sistema de alertas por email
- [ ] Integración con pasarelas de pago
- [ ] App móvil (React Native)
- [ ] Integración con proveedores
- [ ] Predicción de demanda con IA

---

**Desarrollado con ❤️ usando Next.js 15**
