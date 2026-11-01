import { NextResponse } from "next/server";
import { setAdminCookie, verifyAdminPin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter the organizer PIN." }, { status: 400 });
  }
  if (typeof body.pin !== "string" || !body.pin || body.pin.length > 128) {
    return NextResponse.json({ error: "Enter the organizer PIN." }, { status: 400 });
  }
  try {
    if (!verifyAdminPin(body.pin)) {
      return NextResponse.json({ error: "That PIN doesn’t match. Please try again." }, { status: 401 });
    }
    await setAdminCookie();
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Admin authentication is not configured", error);
    return NextResponse.json({ error: "Organizer access is not configured on this server." }, { status: 503 });
  }
}
