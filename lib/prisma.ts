/**
 * @file lib/prisma.ts
 * @description Prisma client singleton for database connection
 * Prevents multiple instantiations in development
 */

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton instance
 * Reuses connection in development to prevent "too many connections" errors
 */
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
