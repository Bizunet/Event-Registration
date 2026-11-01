import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eventDetails } from "@/lib/event";
import TicketPass from "@/components/ticket-pass";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const [{ ticketId }, query] = await Promise.all([params, searchParams]);
  const attendee = await prisma.attendee.findUnique({
    where: { id: ticketId },
    select: { id: true, full_name: true, student_id: true, department: true, year_semester: true, phone: true },
  });
  if (!attendee) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verificationUrl = `${baseUrl}/ticket/${attendee.id}`;

  return (
    <main className="min-h-screen bg-oatmeal px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="no-print inline-flex items-center gap-2 text-sm font-bold text-plum transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to event</Link>
        <div className="mb-7 mt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">You&apos;re on the list</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Your digital event pass</h1>
          <p className="mt-2 text-sm text-ink/70">Save this pass and bring it with you.</p>
        </div>
        {query.email === "sent" && (
          <p role="status" className="mx-auto mb-6 max-w-xl rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-plum">
            A confirmation email with your digital pass link has been sent to your email address.
          </p>
        )}
        {query.email === "not-sent" && (
          <p role="alert" className="mx-auto mb-6 max-w-xl rounded-xl border border-amber-900/15 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            Your registration is confirmed, but we couldn’t send the confirmation email. You can download your pass here.
          </p>
        )}
        <div className="flex justify-center">
          <TicketPass attendee={attendee} verificationUrl={verificationUrl} />
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink/70"><MapPin className="h-3.5 w-3.5" /> {eventDetails.venue} · {eventDetails.date}</p>
      </div>
    </main>
  );
}
