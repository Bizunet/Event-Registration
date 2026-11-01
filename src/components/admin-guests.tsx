"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, LogOut, Search, Users } from "lucide-react";

type Guest = {
  id: string;
  full_name: string;
  student_id: string;
  department: string;
  year_semester: string;
  email: string;
  phone: string;
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
      [guest.student_id, guest.full_name, guest.department].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [guests, query]);

  function exportCsv() {
    const headers = ["Full Name", "Student ID", "Department", "Year & Semester", "Email", "Phone"];
    const rows = filteredGuests.map(({ full_name, student_id, department, year_semester, email, phone }) =>
      [full_name, student_id, department, year_semester, email, phone].map(csvCell).join(","),
    );
    const blob = new Blob(["\uFEFF", [headers.map(csvCell).join(","), ...rows].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dduecsf-guest-roster.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-oatmeal px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-plum hover:text-ink"><ArrowLeft className="h-4 w-4" /> Event page</Link>
        {!authenticated ? (
          <div className="mx-auto mt-16 max-w-md rounded-3xl border border-plum/10 bg-paper p-8 shadow-xl shadow-plum/10">
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
            <div className="mt-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">DDUECSF · Organizer dashboard</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-ink">Guest roster</h1>
                <p className="mt-2 text-sm text-ink/75">Manage registered guests for the Thanksgiving program.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportCsv} disabled={filteredGuests.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-plum px-4 py-3 text-sm font-bold text-white hover:bg-ink disabled:opacity-70"><Download className="h-4 w-4" /> Export CSV</button>
                <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-ink/30"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-[240px_1fr]">
              <div className="rounded-2xl bg-plum p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-white">Total registered</p><p className="mt-2 text-4xl font-black">{guests.length}</p><p className="mt-1 text-xs text-white">attendees</p></div>
              <label className="flex items-center gap-3 self-stretch rounded-2xl border border-ink/10 bg-white px-5 py-4">
                <Search className="h-5 w-5 shrink-0 text-ink/60" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, student ID, or department…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60" aria-label="Search guests by name, student ID, or department" />
              </label>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-oatmeal text-xs uppercase tracking-wider text-ink/70"><tr>{["Attendee", "Student ID", "Department", "Year & semester", "Phone"].map((heading) => <th key={heading} className="px-5 py-4 font-bold">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-ink/5">
                    {filteredGuests.map((guest) => <tr key={guest.id} className="hover:bg-oatmeal/50"><td className="px-5 py-4"><p className="font-bold text-ink">{guest.full_name}</p><p className="mt-1 text-xs text-ink/65">{guest.email}</p></td><td className="px-5 py-4 font-medium">{guest.student_id}</td><td className="px-5 py-4">{guest.department}</td><td className="px-5 py-4">{guest.year_semester}</td><td className="px-5 py-4">{guest.phone}</td></tr>)}
                    {filteredGuests.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-ink/70">{guests.length === 0 ? "No guests registered yet." : "No guests match your search."}</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-ink/5 px-5 py-3 text-xs text-ink/65">{loading ? "Refreshing…" : `Showing ${filteredGuests.length} of ${guests.length} registered guests`}</div>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}
