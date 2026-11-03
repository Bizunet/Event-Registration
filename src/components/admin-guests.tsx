"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Download, FileImage, LogOut, QrCode, Search, Users } from "lucide-react";
import QrScannerModal from "@/components/qr-scanner-modal";
import PaymentReceiptModal from "@/components/payment-receipt-modal";

type Guest = {
  id: string;
  full_name: string;
  department: string;
  year_semester: string;
  email: string;
  phone: string;
  checked_in_at: string | null;
  has_payment_receipt: boolean;
  created_at: string;
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function AdminGuests() {
  const [authenticated, setAuthenticated] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [query, setQuery] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Pick<Guest, "id" | "full_name"> | null>(null);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/guests", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setAuthenticated(false);
        if (response.status !== 401) setError(result.error ?? "Couldn’t load the guest list.");
        return;
      }
      setGuests(result.guests);
      setAuthenticated(true);
      setError("");
    } catch {
      setError("Couldn’t reach the guest list. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGuests(); }, [loadGuests]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Couldn’t sign in.");
        return;
      }
      setPin("");
      await loadGuests();
    } catch {
      setError("Couldn’t reach the sign-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setGuests([]);
  }

  const filteredGuests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return guests;
    return guests.filter((guest) =>
      [guest.full_name, guest.department, guest.email].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [guests, query]);

  function exportCsv() {
    const headers = ["Full Name", "Department", "Year & Semester", "Email", "Phone", "Check-in Status", "Checked In At"];
    const rows = filteredGuests.map(({ full_name, department, year_semester, email, phone, checked_in_at }) =>
      [
        full_name,
        department,
        year_semester,
        email,
        phone,
        checked_in_at ? "Checked In" : "Not Checked In",
        checked_in_at ? new Date(checked_in_at).toLocaleString() : "",
      ].map(csvCell).join(","),
    );
    const blob = new Blob(["\uFEFF", [headers.map(csvCell).join(","), ...rows].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dduecsf-guest-roster.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateCheckedInGuest(attendee: Pick<Guest, "id" | "checked_in_at">) {
    setGuests((currentGuests) => currentGuests.map((guest) =>
      guest.id === attendee.id ? { ...guest, checked_in_at: attendee.checked_in_at } : guest,
    ));
  }

  function formatCheckInTime(value: string) {
    return new Date(value).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-sky-gradient px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-plum px-4 py-4 shadow-lg shadow-ink/10 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="DDUECSF event home">
            <Image src="/dduecsf-logo.png" alt="DDUECSF logo" width={40} height={40} className="h-9 w-9 object-contain" priority />
            <span className="text-xs font-bold tracking-[.12em] text-white sm:text-sm">DDUECSF</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-bold text-ink transition hover:brightness-105">
            <ArrowLeft className="h-4 w-4" /> Event page
          </Link>
        </header>
        {!authenticated ? (
          <div className="mx-auto mt-10 max-w-md rounded-[2rem] border border-plum/10 bg-paper p-6 shadow-xl shadow-plum/10 sm:mt-14 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-plum/10 text-plum"><Users className="h-6 w-6" /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-accent">Organizer access</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Guest roster</h1>
            <p className="mt-3 text-sm leading-6 text-ink/75">Enter your organizer PIN to view and manage the event guest list.</p>
            <form onSubmit={signIn} className="mt-7">
              <label className="block text-sm font-semibold text-ink" htmlFor="pin">Organizer PIN</label>
              <input id="pin" type="password" autoComplete="current-password" required value={pin} onChange={(event) => setPin(event.target.value)} className="mt-2 w-full rounded-xl border border-plum/20 px-4 py-3.5 text-ink outline-none focus:border-plum focus:ring-4 focus:ring-plum/15" />
              {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
              <button disabled={loading} className="mt-5 w-full rounded-xl bg-plum px-5 py-3.5 font-bold text-white hover:bg-ink disabled:opacity-70">{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col justify-between gap-5 sm:mt-10 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">DDUECSF · Organizer dashboard</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Guest roster</h1>
                <p className="mt-2 text-sm text-ink/75">Manage registered guests for the Thanksgiving program.</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button onClick={exportCsv} disabled={filteredGuests.length === 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-plum px-4 py-3 text-sm font-bold text-white hover:bg-ink disabled:opacity-70 sm:flex-none"><Download className="h-4 w-4" /> Export CSV</button>
                <button onClick={() => setScannerOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 sm:flex-none"><QrCode className="h-4 w-4" /><span className="whitespace-nowrap">Scan QR Code</span></button>
                <button onClick={signOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-ink/30"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-[200px_1fr]">
              <div className="rounded-2xl bg-plum p-4 text-white sm:p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-white">Total registered</p><p className="mt-2 text-3xl font-black sm:text-4xl">{guests.length}</p><p className="mt-1 text-xs text-white">attendees</p></div>
              <label className="flex items-center gap-3 self-stretch rounded-2xl border border-ink/10 bg-white px-5 py-4">
                <Search className="h-5 w-5 shrink-0 text-ink/60" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, department, or email…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60" aria-label="Search guests by name, department, or email" />
              </label>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white sm:mt-6">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead className="bg-sky-gradient text-xs uppercase tracking-wider text-ink/70"><tr>{["No.", "Attendee", "Department", "Year & semester", "Phone", "Payment Receipt", "Check-in"].map((heading) => <th key={heading} className="px-5 py-4 font-bold">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-ink/5">
                    {filteredGuests.map((guest, index) => (
                      <tr key={guest.id} className="transition-colors hover:bg-[#dff3ff]">
                        <td className="px-5 py-4 font-semibold text-ink/70">{index + 1}.</td>
                        <td className="px-5 py-4"><p className="font-bold text-ink">{guest.full_name}</p><p className="mt-1 text-xs text-ink/65">{guest.email}</p></td>
                        <td className="px-5 py-4">{guest.department}</td>
                        <td className="px-5 py-4">{guest.year_semester}</td>
                        <td className="px-5 py-4">{guest.phone}</td>
                        <td className="px-5 py-4">
                          {guest.has_payment_receipt ? (
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt({ id: guest.id, full_name: guest.full_name })}
                              className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-200"
                            >
                              <FileImage className="h-3.5 w-3.5" /> View Receipt
                            </button>
                          ) : <span className="text-xs text-ink/55">Not provided</span>}
                        </td>
                        <td className="px-5 py-4">
                          {guest.checked_in_at ? (
                            <span className="inline-flex flex-col items-start gap-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> Checked In</span>
                              <time className="text-xs text-ink/65" dateTime={guest.checked_in_at}>{formatCheckInTime(guest.checked_in_at)}</time>
                            </span>
                          ) : <span className="text-xs font-medium text-ink/60">Not checked in</span>}
                        </td>
                      </tr>
                    ))}
                    {filteredGuests.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-ink/70">{guests.length === 0 ? "No guests registered yet." : "No guests match your search."}</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-ink/10 md:hidden">
                {filteredGuests.map((guest, index) => (
                  <article key={guest.id} className="space-y-3 p-4">
                    <div>
                      <p className="font-bold text-ink">{index + 1}. {guest.full_name}</p>
                      <p className="mt-1 break-all text-xs text-ink/65">{guest.email}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <dt className="text-ink/65">Department</dt><dd className="break-words font-medium text-ink">{guest.department}</dd>
                      <dt className="text-ink/65">Year &amp; semester</dt><dd className="break-words font-medium text-ink">{guest.year_semester}</dd>
                      <dt className="text-ink/65">Phone</dt><dd className="break-words font-medium text-ink">{guest.phone}</dd>
                      <dt className="text-ink/65">Payment receipt</dt><dd className="break-words font-medium text-ink">
                        {guest.has_payment_receipt ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt({ id: guest.id, full_name: guest.full_name })}
                            className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-800"
                          >
                            <FileImage className="h-3 w-3" /> View Receipt
                          </button>
                        ) : <span className="text-ink/60">Not provided</span>}
                      </dd>
                      <dt className="text-ink/65">Check-in</dt><dd className="break-words font-medium text-ink">
                        {guest.checked_in_at ? (
                          <span className="inline-flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800"><CheckCircle2 className="h-3 w-3" /> Checked In</span>
                            <time dateTime={guest.checked_in_at}>{formatCheckInTime(guest.checked_in_at)}</time>
                          </span>
                        ) : <span className="text-ink/60">Not checked in</span>}
                      </dd>
                    </dl>
                  </article>
                ))}
                {filteredGuests.length === 0 && <p className="px-5 py-12 text-center text-sm text-ink/70">{guests.length === 0 ? "No guests registered yet." : "No guests match your search."}</p>}
              </div>
              <div className="border-t border-ink/5 px-5 py-3 text-xs text-ink/65">{loading ? "Refreshing…" : `Showing ${filteredGuests.length} of ${guests.length} registered guests`}</div>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          </>
        )}
      </div>
      {authenticated && scannerOpen && (
        <QrScannerModal
          onClose={() => setScannerOpen(false)}
          onCheckedIn={updateCheckedInGuest}
        />
      )}
      {authenticated && selectedReceipt && (
        <PaymentReceiptModal
          attendeeId={selectedReceipt.id}
          attendeeName={selectedReceipt.full_name}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </main>
  );
}
