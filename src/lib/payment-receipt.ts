import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

function signingSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("A 32-character ADMIN_SESSION_SECRET must be configured.");
  }
  return secret;
}

function signatureFor(url: string, expiresAt: number) {
  return createHmac("sha256", signingSecret())
    .update(`payment-receipt:${url}:${expiresAt}`)
    .digest("hex");
}

export function createReceiptToken(url: string) {
  const expiresAt = Date.now() + TOKEN_LIFETIME_MS;
  return `${expiresAt}.${signatureFor(url, expiresAt)}`;
}

export function isValidReceiptReference(urlValue: unknown, tokenValue: unknown): urlValue is string {
  if (typeof urlValue !== "string" || typeof tokenValue !== "string") return false;

  try {
    const url = new URL(urlValue);
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".blob.vercel-storage.com") ||
      !url.pathname.startsWith("/payment-receipts/") ||
      url.username ||
      url.password
    ) {
      return false;
    }

    const [expiresAtText, receivedSignature, ...extra] = tokenValue.split(".");
    if (extra.length > 0 || !/^\d+$/.test(expiresAtText) || !/^[a-f0-9]{64}$/i.test(receivedSignature)) {
      return false;
    }

    const expiresAt = Number(expiresAtText);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || expiresAt > Date.now() + TOKEN_LIFETIME_MS) {
      return false;
    }

    const expected = Buffer.from(signatureFor(url.toString(), expiresAt), "hex");
    const received = Buffer.from(receivedSignature, "hex");
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}
