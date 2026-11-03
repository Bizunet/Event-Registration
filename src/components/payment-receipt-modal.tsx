"use client";

import { useState } from "react";
import { ImageOff, X } from "lucide-react";

export default function PaymentReceiptModal({
  attendeeId,
  attendeeName,
  onClose,
}: {
  attendeeId: string;
  attendeeName: string;
  onClose: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
        className="max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-paper shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-plum">Payment receipt</p>
            <h2 id="receipt-modal-title" className="mt-1 truncate text-lg font-black text-ink sm:text-xl">{attendeeName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close receipt" className="shrink-0 rounded-full p-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex max-h-[calc(95vh-5rem)] min-h-64 items-center justify-center overflow-auto bg-oatmeal p-3 sm:p-6">
          {failed ? (
            <div role="alert" className="p-8 text-center text-sm font-medium text-ink/70">
              <ImageOff className="mx-auto mb-3 h-8 w-8" />
              The receipt could not be loaded. Please try again or verify your Blob storage configuration.
            </div>
          ) : (
            <img
              src={`/api/admin/receipts/${encodeURIComponent(attendeeId)}`}
              alt={`Payment receipt from ${attendeeName}`}
              onError={() => setFailed(true)}
              className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-md"
            />
          )}
        </div>
      </section>
    </div>
  );
}
