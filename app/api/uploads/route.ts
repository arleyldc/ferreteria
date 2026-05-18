import { NextRequest, NextResponse } from "next/server";
import { uploadImageToMinio } from "@/lib/minio";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "MinIO storage is not configured" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof (file as any).arrayBuffer !== "function") {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    const fileBlob = file as File;
    const fileType = fileBlob.type || "application/octet-stream";
    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const fileName = fileBlob.name || "image.jpg";
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const imageUrl = await uploadImageToMinio(fileName, buffer, fileType);

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
