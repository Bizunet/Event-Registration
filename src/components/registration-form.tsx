"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, Sandwich, Shirt } from "lucide-react";

const fields = [
  { name: "full_name", label: "Full name", placeholder: "e.g. Hana Tesfaye", autoComplete: "name" },
  { name: "student_id", label: "Student ID", placeholder: "Your university student ID", autoComplete: "off" },
  { name: "department", label: "Department", placeholder: "e.g. Computer Science", autoComplete: "organization-title" },
  { name: "year_semester", label: "Year & semester", placeholder: "e.g. Year 2 Sem 1", autoComplete: "off" },
  { name: "email", label: "Email address", placeholder: "you@example.com", autoComplete: "email", type: "email" },
  { name: "phone", label: "Phone number", placeholder: "+251 9XX XXX XXX", autoComplete: "tel", type: "tel" },
] as const;

export default function RegistrationForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setSuccess(false);
        setMessage(result.error ?? "We couldn’t complete your registration. Please try again.");
        return;
      }
      setSuccess(true);
      setMessage("You’re registered! Your digital pass is ready.");
      router.push(`/ticket/${result.ticketId}`);
    } catch {
      setSuccess(false);
      setMessage("We couldn’t reach the registration service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-plum/15 bg-oatmeal p-6 shadow-xl shadow-plum/5 sm:p-9" noValidate>
      <section aria-labelledby="event-guidelines-title" className="mb-8 rounded-2xl border border-plum/15 bg-paper p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Before you register</p>
          <h3 id="event-guidelines-title" className="mt-2 text-xl font-black tracking-tight text-ink">
            Event Guidelines / What to Know Before Registering
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-plum/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-plum/10 text-plum">
                <Shirt className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex h-7 overflow-hidden rounded-full border border-ink/15" aria-label="Black and white dress theme">
                <span className="w-7 bg-black" />
                <span className="w-7 bg-white" />
              </span>
            </div>
            <h4 className="font-bold text-ink">Dress Code: Black &amp; White</h4>
            <p className="mt-2 text-sm leading-6 text-ink/75">
              Please come dressed in Full Black, Full White, or a Black &amp; White combination.
            </p>
          </article>
          <article className="rounded-xl border border-gold/40 bg-white p-4">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-accent">
              <Sandwich className="h-5 w-5" aria-hidden="true" />
            </span>
            <h4 className="font-bold text-ink">Overnight Fellowship</h4>
            <p className="mt-2 text-sm leading-6 text-ink/75">
              Don&apos;t forget to bring snacks to share and enjoy during the overnight program!
            </p>
          </article>
        </div>
      </section>
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold tracking-tight text-ink">Attendee details</h3>
        <p className="mt-2 text-sm text-ink/70">All fields are required for your event pass.</p>
      </div>
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">{field.label}<span className="text-plum"> *</span></span>
            <input
              name={field.name}
              type={"type" in field ? field.type : "text"}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              required
              maxLength={field.name === "full_name" ? 160 : field.name === "email" ? 254 : field.name === "student_id" ? 80 : field.name === "department" ? 120 : 80}
              className="w-full rounded-xl border border-plum/20 bg-white px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-ink/55 focus:border-plum focus:ring-4 focus:ring-plum/15"
            />
          </label>
        ))}
      </div>
      {message && (
        <div role={success ? "status" : "alert"} className={`mt-6 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${success ? "bg-plum/10 text-plum" : "bg-red-50 text-red-700"}`}>
          {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}
      <button disabled={submitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 py-4 font-bold text-white transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Registering…</> : <>Register &amp; get my pass <ArrowRight className="h-4 w-4" /></>}
      </button>
      <p className="mt-4 text-center text-xs text-ink/65">Your details are used only for event registration.</p>
    </form>
  );
}
