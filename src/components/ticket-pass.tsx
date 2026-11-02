"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { Download, LoaderCircle, MapPin } from "lucide-react";
import { toPng } from "html-to-image";
import { eventDetails } from "@/lib/event";

type Attendee = { id: string; full_name: string; department: string; year_semester: string; phone: string };

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
      link.download = `DDUECSF-pass-${attendee.id}.png`;
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
      <article ref={passRef} className="print-card overflow-hidden rounded-[1.75rem] bg-white text-center shadow-2xl shadow-plum/15">
        <header className="relative overflow-hidden bg-plum px-7 py-7 text-white sm:px-9 sm:py-8">
          <div className="absolute -right-12 -top-24 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-center">
            <Image src="/dduecsf-logo.png" alt="DDUECSF logo" width={48} height={48} unoptimized className="mb-3 h-12 w-12 object-contain" />
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white">{eventDetails.shortOrganizer}</p>
            <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">{eventDetails.name}</h2>
          </div>
          <div className="relative mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs font-medium text-white sm:text-sm">
            <span>{eventDetails.date}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{eventDetails.venue}</span>
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-6 px-5 py-6 sm:gap-7 sm:px-9 sm:py-8">
          <div className="w-full text-center">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Admit one · Attendee</p>
            <h3 className="mt-2 break-words text-2xl font-black tracking-tight text-ink">{attendee.full_name}</h3>
          </div>

          <dl className="flex w-full max-w-sm flex-col divide-y divide-ink/10 text-left text-sm">
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="shrink-0 text-ink/70">Department</dt>
              <dd className="break-words text-right font-semibold text-ink">{attendee.department}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="shrink-0 text-ink/70">Year &amp; semester</dt>
              <dd className="break-words text-right font-semibold text-ink">{attendee.year_semester}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="shrink-0 text-ink/70">Phone</dt>
              <dd className="break-words text-right font-semibold text-ink">{attendee.phone}</dd>
            </div>
          </dl>

          <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-sky-gradient p-3">
            <QRCodeSVG value={verificationUrl} size={150} level="H" includeMargin />
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[.15em] text-ink/65">Scan to verify</span>
          </div>
        </div>

        <footer className="flex flex-col items-center justify-center gap-3 border-t border-dashed border-ink/15 px-7 py-4">
          <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-ink/70">Ticket reference</p><p className="mt-1 break-all font-mono text-[10px] font-semibold tracking-wider text-plum">{attendee.id.toUpperCase()}</p></div>
          <span className="shrink-0 rounded-full bg-sky-gradient px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink">Digital pass</span>
        </footer>
      </article>
      <div className="no-print mt-5">
        <button onClick={downloadPass} disabled={downloading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 py-4 font-bold text-white shadow-lg shadow-plum/20 transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum disabled:cursor-not-allowed disabled:opacity-70">
          {downloading ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Preparing pass…</> : <><Download className="h-5 w-5" /> Download your pass</>}
        </button>
        {error && <p role="alert" className="mt-3 text-center text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
