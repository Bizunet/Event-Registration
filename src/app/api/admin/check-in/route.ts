import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function ticketIdFromCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim();
  let ticketId = code;

  if (code.includes("://")) {
    try {
      const url = new URL(code);
      const match = url.pathname.match(/\/ticket\/([^/]+)\/?$/);
      if (!match) return null;
      ticketId = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId)
    ? ticketId
    : null;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Please sign in to check in guests." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid ticket." }, { status: 400 });
    }

    const ticketId = ticketIdFromCode(
      body && typeof body === "object" ? (body as Record<string, unknown>).code : null,
    );
    if (!ticketId) {
      return NextResponse.json({ status: "invalid", error: "Invalid ticket." }, { status: 400 });
    }

    const now = new Date();
    const update = await prisma.attendee.updateMany({
      where: { id: ticketId, checked_in_at: null },
      data: { checked_in_at: now },
    });

    if (update.count === 0) {
      const existing = await prisma.attendee.findUnique({
        where: { id: ticketId },
        select: { id: true, full_name: true, department: true, year_semester: true, checked_in_at: true },
      });
      if (!existing) {
        return NextResponse.json({ status: "invalid", error: "Invalid ticket. No matching guest was found." }, { status: 404 });
      }
      return NextResponse.json(
        { status: "already_checked_in", error: "Already Checked In.", attendee: existing },
        { status: 409 },
      );
    }

    const attendee = await prisma.attendee.findUnique({
      where: { id: ticketId },
      select: { id: true, full_name: true, department: true, year_semester: true, checked_in_at: true },
    });
    if (!attendee) {
      return NextResponse.json({ status: "invalid", error: "Invalid ticket. No matching guest was found." }, { status: 404 });
    }

    return NextResponse.json({ status: "checked_in", attendee });
  } catch (error) {
    console.error("Failed to check in attendee", error);
    return NextResponse.json({ error: "Couldn’t check in this guest right now." }, { status: 500 });
  }
}
