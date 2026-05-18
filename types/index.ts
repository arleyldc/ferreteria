/**
 * @file types/index.ts
 * @description TypeScript type definitions for the application
 */

import type { Role } from "@prisma/client";

/**
 * User session type extended from NextAuth
 */
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Product inventory data
 */
export interface ProductInventory {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  unitBase: string;
  stockCurrent: number;
  stockMin: number;
  costPriceAvg: number;
  totalStockValue: number;
  location: string | null;
  imageUrl: string | null;
  isFractionable: boolean;
}

/**
 * Product with all details
 */
export interface ProductDetail extends ProductInventory {
  description: string | null;
  unitConversions: {
    unitName: string;
    quantityInBase: number;
    isDefault: boolean;
  }[];
  prices: {
    customerType: string;
    price: number;
  }[];
}

/**
 * Inventory movement data
 */
export interface InventoryMovementData {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: "ENTRY" | "EXIT";
  subType: string;
  quantity: number;
  quantityInBase: number;
  unitUsed: string;
  unitPrice: number | null;
  documentNumber: string | null;
  reason: string | null;
  userId: string;
  userName: string;
  customerName: string | null;
  createdAt: Date;
}

/**
 * Stock alert data
 */
export interface StockAlert {
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  percentageOfMin: number;
}

/**
 * Dashboard KPIs
 */
export interface DashboardKpis {
  totalProductsValue: number;
  productsUnderMinStock: number;
  movementsLast30Days: number;
  topSoldProduct: {
    name: string;
    quantity: number;
  } | null;
  avaLast7DaysRevenue: number;
}

/**
 * Sale data for POS
 */
export interface SaleData {
  id: string;
  saleNumber: string;
  customerType: string;
  customerName: string | null;
  items: {
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  total: number;
  discount: number;
  paymentMethod: "cash" | "card" | "transfer";
  createdAt: Date;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  actionType: string;
  userName: string;
  details: Record<string, any>;
  ipAddress: string | null;
  createdAt: Date;
}

/**
 * Form errors type
 */
export type FormErrors = Record<string, string[] | undefined>;
