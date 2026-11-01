"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, LoaderCircle, MapPin, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { eventDetails } from "@/lib/event";

type Attendee = { id: string; full_name: string; student_id: string; department: string; year_semester: string; phone: string };

export default function TicketPass({ attendee, verificationUrl }: { attendee: Attendee; verificationUrl: string }) {
  const passRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function downloadPass() {
    if (!passRef.current) return;
    setDownloading(true);
    setError("");
    try {
      const dataUrl = await toPng(passRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `DDUECSF-pass-${attendee.student_id.replace(/[^a-zA-Z0-9-]/g, "")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (downloadError) {
      console.error("Pass image download failed", downloadError);
      setError("Couldn’t save the image. Please try again or use your device’s screenshot.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-[540px]">
      <article ref={passRef} className="print-card overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-forest/10">
        <header className="relative overflow-hidden bg-forest px-7 py-7 text-white sm:px-9 sm:py-8">
          <div className="absolute -right-12 -top-24 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">{eventDetails.shortOrganizer}</p>
              <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight tracking-tight sm:text-3xl">{eventDetails.name}</h2>
            </div>
            <Sparkles className="mt-1 h-6 w-6 shrink-0 text-gold" />
          </div>
          <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs font-medium text-white/75 sm:text-sm">
            <span>{eventDetails.date}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{eventDetails.venue}</span>
          </div>
        </header>

        <div className="grid gap-7 px-7 py-7 sm:grid-cols-[1fr_auto] sm:px-9 sm:py-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold">Admit one · Attendee</p>
            <h3 className="mt-2 break-words text-2xl font-black tracking-tight text-ink">{attendee.full_name}</h3>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
              <dt className="text-ink/45">Student ID</dt><dd className="font-semibold text-ink">{attendee.student_id}</dd>
              <dt className="text-ink/45">Department</dt><dd className="font-semibold text-ink">{attendee.department}</dd>
              <dt className="text-ink/45">Year &amp; semester</dt><dd className="font-semibold text-ink">{attendee.year_semester}</dd>
              <dt className="text-ink/45">Phone</dt><dd className="font-semibold text-ink">{attendee.phone}</dd>
            </dl>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-cream p-3">
            <QRCodeSVG value={verificationUrl} size={132} level="H" includeMargin />
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[.15em] text-ink/45">Scan to verify</span>
          </div>
        </div>
        <footer className="flex items-center justify-between gap-4 border-t border-dashed border-ink/15 px-7 py-4 sm:px-9">
          <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-ink/40">Ticket reference</p><p className="mt-1 break-all font-mono text-[10px] font-semibold tracking-wider text-forest">{attendee.id.toUpperCase()}</p></div>
          <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink">Digital pass</span>
        </footer>
      </article>
      <div className="no-print mt-5">
        <button onClick={downloadPass} disabled={downloading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-4 font-bold text-white transition hover:bg-ink disabled:opacity-60">
          {downloading ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Preparing pass…</> : <><Download className="h-5 w-5" /> Download pass</>}
        </button>
        {error && <p role="alert" className="mt-3 text-center text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
