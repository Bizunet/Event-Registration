import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Please sign in to view the guest list." }, { status: 401 });
    const guests = await prisma.attendee.findMany({
      select: {
        id: true,
        full_name: true,
        department: true,
        year_semester: true,
        email: true,
        phone: true,
        checked_in_at: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Failed to load attendee roster", error);
    return NextResponse.json({ error: "Couldn’t load the guest list right now." }, { status: 500 });
  }
}
