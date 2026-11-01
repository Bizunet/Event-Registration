import nodemailer from "nodemailer";
import { eventDetails } from "@/lib/event";

type ConfirmationEmailInput = {
  email: string;
  fullName: string;
  ticketUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendConfirmationEmail({ email, fullName, ticketUrl }: ConfirmationEmailInput) {
  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !portValue || !user || !password || !from) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM must be configured.");
  }

  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const escapedName = escapeHtml(fullName);
  const escapedEventName = escapeHtml(eventDetails.name);
  const escapedVenue = escapeHtml(eventDetails.venue);
  const escapedDate = escapeHtml(eventDetails.date);

  await transporter.sendMail({
    from,
    to: email,
    subject: `Registration confirmed: ${eventDetails.name}`,
    text: [
      `Hello ${fullName},`,
      "",
      `Your registration for ${eventDetails.name} is confirmed.`,
      `Date: ${eventDetails.date}`,
      `Venue: ${eventDetails.venue}`,
      "",
      `View and download your digital pass: ${ticketUrl}`,
      "",
      eventDetails.shortOrganizer,
    ].join("\n"),
    html: `
      <div style="background:#f5eee4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#281522">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden">
          <div style="background:#2d002b;padding:28px 32px;color:#ffffff">
            <p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:3px">${eventDetails.shortOrganizer}</p>
            <h1 style="margin:0;font-size:24px;line-height:1.3">${escapedEventName}</h1>
          </div>
          <div style="padding:32px">
            <h2 style="margin:0 0 12px;font-size:20px">You’re registered, ${escapedName}!</h2>
            <p style="margin:0 0 24px;line-height:1.6">Your place is confirmed. Save your digital pass and have it ready for the event.</p>
            <p style="margin:0 0 8px"><strong>Date:</strong> ${escapedDate}</p>
            <p style="margin:0 0 24px"><strong>Venue:</strong> ${escapedVenue}</p>
            <p style="margin:0 0 28px">
              <a href="${escapeHtml(ticketUrl)}" style="display:inline-block;background:#2d002b;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:bold">View your digital pass</a>
            </p>
            <p style="margin:0;color:#594b56;font-size:13px">With gratitude,<br>${eventDetails.shortOrganizer}</p>
          </div>
        </div>
      </div>
    `,
  });
}
