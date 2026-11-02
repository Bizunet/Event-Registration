import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params;
    const attendee = await prisma.attendee.findUnique({
      where: { id: ticketId },
      select: { id: true, full_name: true, department: true, year_semester: true, phone: true },
    });
    if (!attendee) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    return NextResponse.json(attendee);
  } catch (error) {
    console.error("Failed to retrieve ticket", error);
    return NextResponse.json({ error: "Couldn’t retrieve this ticket right now." }, { status: 500 });
  }
}
