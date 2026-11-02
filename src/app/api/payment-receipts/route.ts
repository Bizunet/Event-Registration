import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createReceiptToken } from "@/lib/payment-receipt";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10") {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

const extensionForType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Select a valid receipt image to upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Select a receipt image to upload." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "The receipt image must be 4 MB or smaller." }, { status: 413 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, and WebP receipt images are allowed." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (detectImageType(bytes) !== file.type) {
    return NextResponse.json({ error: "The selected file is not a valid image of the specified type." }, { status: 415 });
  }

  try {
    const blob = await put(
      `payment-receipts/${randomUUID()}.${extensionForType[file.type]}`,
      new Blob([bytes], { type: file.type }),
      {
        access: "private",
        addRandomSuffix: false,
        contentType: file.type,
        cacheControlMaxAge: 60,
      },
    );
    return NextResponse.json({ url: blob.url, token: createReceiptToken(blob.url) }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload payment receipt", error);
    return NextResponse.json({ error: "Receipt upload is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
