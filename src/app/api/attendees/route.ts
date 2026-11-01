import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateAttendee } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit valid registration details." }, { status: 400 });
  }

  const validated = validateAttendee(body);
  if (!validated.success) return NextResponse.json({ error: validated.message }, { status: 400 });

  try {
    const attendee = await prisma.attendee.create({ data: validated.data, select: { id: true } });
    return NextResponse.json({ ticketId: attendee.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(" ") : String(error.meta?.target ?? "");
      const field = target.toLowerCase().includes("email") ? "email" : "student ID";
      return NextResponse.json({ error: `This ${field} is already registered. Please check your details or contact an organizer.` }, { status: 409 });
    }
    console.error("Failed to create attendee registration", error);
    return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again shortly." }, { status: 500 });
  }
}
