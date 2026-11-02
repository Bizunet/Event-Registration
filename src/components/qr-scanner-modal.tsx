"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, LoaderCircle, QrCode, SwitchCamera, X } from "lucide-react";
import type { Html5Qrcode } from "html5-qrcode";

type AttendeeCheckIn = {
  id: string;
  full_name: string;
  department: string;
  year_semester: string;
  checked_in_at: string;
};

type ScanFeedback =
  | { kind: "success"; attendee: AttendeeCheckIn }
  | { kind: "warning"; message: string }
  | { kind: "error"; message: string };

export default function QrScannerModal({
  onClose,
  onCheckedIn,
}: {
  onClose: () => void;
  onCheckedIn: (attendee: AttendeeCheckIn) => void;
}) {
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraState, setCameraState] = useState<"starting" | "ready" | "error">("starting");
  const [cameraError, setCameraError] = useState("");
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockedRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const onCheckedInRef = useRef(onCheckedIn);

  onCheckedInRef.current = onCheckedIn;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleDecodedCode = useCallback(async (code: string) => {
    if (scanLockedRef.current) return;
    scanLockedRef.current = true;

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result: {
        status?: string;
        error?: string;
        attendee?: AttendeeCheckIn;
      } = await response.json();

      if (response.status === 401) {
        setFeedback({ kind: "error", message: result.error ?? "Your organizer session has expired. Please sign in again." });
      } else if (result.status === "checked_in" && response.ok && result.attendee) {
        setFeedback({ kind: "success", attendee: result.attendee });
        onCheckedInRef.current(result.attendee);
      } else if (result.status === "already_checked_in") {
        if (result.attendee) onCheckedInRef.current(result.attendee);
        setFeedback({ kind: "warning", message: "Already Checked In." });
      } else if (result.status === "invalid") {
        setFeedback({ kind: "warning", message: "Invalid Ticket. No matching guest was found." });
      } else {
        setFeedback({ kind: "error", message: result.error ?? "Couldn’t check in this guest. Please try again." });
      }
    } catch {
      setFeedback({ kind: "error", message: "Couldn’t reach the check-in service. Please try again." });
    } finally {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        scanLockedRef.current = false;
      }, 2000);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    let scanner: Html5Qrcode | null = null;

    async function startScanner() {
      setCameraState("starting");
      setCameraError("");
      try {
        await stopPromiseRef.current;
        if (cancelled) return;
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        scanner = new Html5Qrcode("ticket-qr-reader", { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: cameraFacingMode },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => { void handleDecodedCode(decodedText); },
          () => {},
        );
        started = true;
        if (cancelled) {
          await scanner.stop();
          scanner.clear();
          return;
        }
        setCameraState("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Could not start the QR scanner camera", error);
          setCameraState("error");
          setCameraError("Camera access failed. Allow camera permission and use HTTPS or localhost, then try again.");
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      if (scanner && started) {
        stopPromiseRef.current = scanner.stop().then(() => scanner?.clear()).then(() => undefined).catch((error: unknown) => {
          console.error("Could not stop the QR scanner camera", error);
        });
      }
      if (scannerRef.current === scanner) scannerRef.current = null;
    };
  }, [cameraFacingMode, handleDecodedCode]);

  function closeModal() {
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082c35]/70 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeModal();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-title"
        className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-paper p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-plum/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-plum">
              <QrCode className="h-4 w-4" /> Guest check-in
            </div>
            <h2 id="scanner-title" className="mt-3 text-2xl font-black tracking-tight text-ink">Scan ticket QR code</h2>
            <p className="mt-1 text-sm text-ink/70">Center the attendee&apos;s ticket QR code inside the frame.</p>
          </div>
          <button type="button" onClick={closeModal} aria-label="Close scanner" className="rounded-full p-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-plum/15 bg-[#082c35]">
          <div id="ticket-qr-reader" className="min-h-64 w-full [&_video]:rounded-2xl [&_video]:object-cover" />
          {cameraState === "starting" && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-white">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Starting camera…
            </div>
          )}
          {cameraState === "error" && (
            <div role="alert" className="p-5 text-center text-sm text-white">
              <CameraOff className="mx-auto mb-2 h-6 w-6" />
              {cameraError}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-medium text-ink/65">
            {cameraState === "ready" ? <Camera className="h-4 w-4 text-plum" /> : <CameraOff className="h-4 w-4" />}
            {cameraState === "ready" ? "Camera ready" : "Camera not active"}
          </p>
          <button
            type="button"
            onClick={() => setCameraFacingMode((current) => current === "environment" ? "user" : "environment")}
            disabled={cameraState === "error"}
            className="inline-flex items-center gap-2 rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm font-semibold text-plum transition hover:bg-plum/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SwitchCamera className="h-4 w-4" />
            Switch to {cameraFacingMode === "environment" ? "front" : "rear"} camera
          </button>
        </div>

        {feedback && (
          <div
            role={feedback.kind === "success" ? "status" : "alert"}
            className={`mt-5 rounded-2xl border p-4 ${
              feedback.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : feedback.kind === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {feedback.kind === "success" ? (
              <>
                <p className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="h-5 w-5" /> Ticket Verified · Checked In</p>
                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-[145px_1fr]">
                  <dt className="font-semibold opacity-75">Full name</dt><dd className="font-bold">{feedback.attendee.full_name}</dd>
                  <dt className="font-semibold opacity-75">Department</dt><dd>{feedback.attendee.department}</dd>
                  <dt className="font-semibold opacity-75">Year &amp; semester</dt><dd>{feedback.attendee.year_semester}</dd>
                </dl>
              </>
            ) : <p className="font-bold">{feedback.message}</p>}
            <p className="mt-2 text-xs opacity-70">Ready to scan again in 2 seconds.</p>
          </div>
        )}

        <button type="button" onClick={closeModal} className="mt-5 w-full rounded-xl bg-plum px-5 py-3.5 font-bold text-white transition hover:bg-ink">
          Close scanner
        </button>
      </section>
    </div>
  );
}
