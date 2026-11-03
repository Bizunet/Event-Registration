import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eventDetails } from "@/lib/event";
import TicketPass from "@/components/ticket-pass";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const attendee = await prisma.attendee.findUnique({
    where: { id: ticketId },
    select: { id: true, full_name: true, department: true, year_semester: true, phone: true },
  });
  if (!attendee) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verificationUrl = `${baseUrl}/ticket/${attendee.id}`;

  return (
    <main className="min-h-screen bg-warm-gradient px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="no-print flex items-center justify-between gap-4 rounded-[1.5rem] bg-plum px-4 py-4 shadow-lg shadow-ink/10 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="DDUECSF event home">
            <Image src="/dduecsf-logo.png" alt="DDUECSF logo" width={40} height={40} className="h-9 w-9 object-contain" priority />
            <span className="text-xs font-bold tracking-[.12em] text-white sm:text-sm">DDUECSF</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-bold text-ink transition hover:brightness-105">
            <ArrowLeft className="h-4 w-4" /> Back to event
          </Link>
        </header>

        <section className="mt-6 rounded-[2rem] bg-plum px-5 py-7 text-center text-white shadow-[0_20px_45px_rgba(9,44,42,0.18)] sm:px-8 sm:py-9">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/75">You&apos;re on the list</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.05em] text-white sm:text-4xl">Your digital event pass</h1>
          <p className="mt-2 text-sm text-white/80">Save this pass and bring it with you.</p>
        </section>
        <div className="mt-7 flex justify-center">
          <TicketPass attendee={attendee} verificationUrl={verificationUrl} />
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink/70"><MapPin className="h-3.5 w-3.5" /> {eventDetails.venue} · {eventDetails.date}</p>
      </div>
    </main>
  );
}
