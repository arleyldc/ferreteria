/**
 * @file lib/utils.ts
 * @description Utility functions for the application
 * Includes CN (class name merger) and other helpers
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence handling
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to Colombian Pesos (or your currency)
 * @param value - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with decimals
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Generate a unique code for products
 * @param prefix - Optional prefix for the code
 * @returns Generated code
 */
export function generateProductCode(prefix = "PROD"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a unique sale/document number
 * @param prefix - Optional prefix
 * @returns Generated number
 */
export function generateDocumentNumber(prefix = "DOC"): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate weighted average cost price
 * CRITICAL FUNCTION for inventory management
 * Formula: ((currentStock × currentCostPrice) + (newQuantity × newCostPrice)) / (currentStock + newQuantity)
 * @param currentStock - Current stock in base unit
 * @param currentCostPrice - Current average cost price
 * @param newQuantity - New quantity added (in base unit)
 * @param newCostPrice - Cost price of new quantity
 * @returns New weighted average cost price
 */
export function calculateWeightedAverageCost(
  currentStock: number,
  currentCostPrice: number,
  newQuantity: number,
  newCostPrice: number,
): number {
  if (currentStock + newQuantity === 0) return 0;

  const totalValue =
    currentStock * currentCostPrice + newQuantity * newCostPrice;
  return totalValue / (currentStock + newQuantity);
}

/**
 * Convert quantity from one unit to another using conversion ratio
 * @param quantity - Quantity to convert
 * @param fromUnitRatio - Ratio of source unit to base unit
 * @param toUnitRatio - Ratio of target unit to base unit
 * @returns Converted quantity
 */
export function convertUnits(
  quantity: number,
  fromUnitRatio: number,
  toUnitRatio: number,
): number {
  if (fromUnitRatio === 0 || toUnitRatio === 0) return 0;
  // Convert to base unit, then to target unit
  const inBaseUnit = quantity * fromUnitRatio;
  return inBaseUnit / toUnitRatio;
}

/**
 * Check if product is below minimum stock
 * @param currentStock - Current stock
 * @param minStock - Minimum stock threshold
 * @returns True if stock is critical
 */
export function isStockCritical(
  currentStock: number,
  minStock: number,
): boolean {
  return currentStock <= minStock;
}

/**
 * Get stock status badge color
 * @param currentStock - Current stock
 * @param minStock - Minimum stock
 * @returns Color class for badge
 */
export function getStockStatusColor(
  currentStock: number,
  minStock: number,
): string {
  if (currentStock <= 0) return "bg-red-600";
  if (currentStock <= minStock) return "bg-yellow-500";
  return "bg-green-600";
}

/**
 * Sleep utility for delays
 * @param ms - Milliseconds to sleep
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get user's IP address from request headers
 * @param request - The Request object
 * @returns IP address string
 */
export function getClientIp(request?: Request): string {
  if (!request) return "unknown";

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
