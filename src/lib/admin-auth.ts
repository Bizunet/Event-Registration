import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dduecsf_admin";
const MAX_AGE = 60 * 60 * 8;

function sessionToken() {
  const pin = process.env.ADMIN_PIN;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!pin || !secret || secret.length < 32) {
    throw new Error("ADMIN_PIN and a 32-character ADMIN_SESSION_SECRET must be configured.");
  }
  return createHmac("sha256", secret).update(`dduecsf-admin:${pin}`).digest("hex");
}

export function verifyAdminPin(pin: string) {
  const expectedPin = process.env.ADMIN_PIN;
  if (!expectedPin) throw new Error("ADMIN_PIN must be configured.");
  const supplied = Buffer.from(pin);
  const expected = Buffer.from(expectedPin);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function setAdminCookie() {
  (await cookies()).set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  (await cookies()).set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function isAdminAuthenticated() {
  const received = (await cookies()).get(COOKIE_NAME)?.value;
  if (!received) return false;
  const expected = sessionToken();
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}
