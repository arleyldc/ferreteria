/**
 * @file lib/env.ts
 * @description Environment variables validation using Zod
 * Ensures all required environment variables are set at runtime
 */

import { z } from "zod";

// Define environment schema with validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid database URL"),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // Email (Optional, for alerts)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  // MinIO image storage (optional - required for image uploads)
  MINIO_ENDPOINT: z.string().min(1, "MINIO_ENDPOINT is required").optional(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z
    .string()
    .min(1, "MINIO_ACCESS_KEY is required")
    .optional(),
  MINIO_SECRET_KEY: z
    .string()
    .min(1, "MINIO_SECRET_KEY is required")
    .optional(),
  MINIO_BUCKET: z
    .string()
    .min(1, "MINIO_BUCKET is required")
    .default("ferreteria"),
  MINIO_PUBLIC_URL: z
    .string()
    .url("MINIO_PUBLIC_URL must be a valid URL")
    .optional(),

  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Parsed and validated environment variables
 */
type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables at startup
 * Throws error if required variables are missing
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.errors);
    throw new Error("Invalid environment variables. Check .env.local file.");
  }

  return parsed.data;
}

// Export validated env
export const env = validateEnv();

export type { Env };
