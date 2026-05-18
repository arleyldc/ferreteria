import { Client } from "minio";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/env";

let minioClient: Client | null = null;

function getMinioClient() {
  if (
    !minioClient &&
    env.MINIO_ENDPOINT &&
    env.MINIO_ACCESS_KEY &&
    env.MINIO_SECRET_KEY
  ) {
    minioClient = new Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
  }
  return minioClient;
}

async function ensureBucketExists() {
  const client = getMinioClient();
  if (!client) throw new Error("MinIO is not configured");

  try {
    const exists = await client.bucketExists(env.MINIO_BUCKET);
    if (!exists) {
      await client.makeBucket(env.MINIO_BUCKET, "us-east-1");
    }
  } catch (error: any) {
    throw error;
  }
}

export async function uploadImageToMinio(
  fileName: string,
  data: Buffer,
  contentType: string,
) {
  const client = getMinioClient();
  if (!client || !env.MINIO_PUBLIC_URL) {
    throw new Error("MinIO is not properly configured");
  }

  await ensureBucketExists();

  const objectName = `product-images/${uuidv4()}-${fileName}`;
  await client.putObject(env.MINIO_BUCKET, objectName, data, data.length, {
    "Content-Type": contentType,
    "x-amz-acl": "public-read", // Hacer el archivo público
  });

  return `${env.MINIO_PUBLIC_URL}/${env.MINIO_BUCKET}/${objectName}`;
}

// export async function getImageFromMinio(url: string) {
//   const client = getMinioClient();
//   if (!client) throw new Error("MinIO is not configured");

//   try {
//     const urlObj = new URL(url);
//     const objectName = urlObj.pathname.split("/").slice(2).join("/"); // Saltar el bucket
//     const stream = await client.getObject(env.MINIO_BUCKET, objectName);

//     const chunks: Buffer[] = [];
//     for await (const chunk of stream) {
//       chunks.push(chunk);
//     }
//     return Buffer.concat(chunks);
//   } catch (error: any) {
//     throw new Error(`Error fetching image from MinIO: ${error.message}`);
//   }
// }
