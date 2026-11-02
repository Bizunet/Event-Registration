import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const imageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attendeeId: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Please sign in to view payment receipts." }, { status: 401 });
    }

    const { attendeeId } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attendeeId)) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
      select: { payment_receipt_url: true },
    });
    if (!attendee?.payment_receipt_url) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    const receipt = await get(attendee.payment_receipt_url, { access: "private" });
    if (!receipt || receipt.statusCode !== 200 || !imageTypes.has(receipt.blob.contentType)) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    return new Response(receipt.stream, {
      status: 200,
      headers: {
        "Content-Type": receipt.blob.contentType,
        "Content-Length": String(receipt.blob.size),
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        "Vary": "Cookie",
      },
    });
  } catch (error) {
    console.error("Failed to retrieve payment receipt", error);
    return NextResponse.json({ error: "Couldn’t load the payment receipt right now." }, { status: 500 });
  }
}
