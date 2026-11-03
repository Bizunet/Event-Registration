import Image from "next/image";
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import RegistrationForm from "@/components/registration-form";
import { eventDetails } from "@/lib/event";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-warm-gradient text-ink">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-2">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label="DDUECSF home">
            <Image src="/dduecsf-logo.png" alt="DDUECSF logo" width={42} height={42} className="h-9 w-9 object-contain sm:h-10 sm:w-10" priority />
            <span className="truncate text-sm font-bold tracking-[.12em] text-ink">DDUECSF</span>
          </a>
          <a href="#register" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-bold text-ink transition hover:brightness-105 sm:px-5 sm:text-sm">
            Register <ArrowUpRight className="h-4 w-4" />
          </a>
        </header>

        <section className="mt-5 rounded-2xl bg-plum px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">DDUECSF presents</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-5xl lg:text-7xl">
            100 Days Left
            <span className="mt-2 block text-gold">A night to give thanks.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            Gather in joy. Celebrate in faith. Make memories together in an unforgettable overnight fellowship experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-5 text-sm font-semibold text-white/90">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{eventDetails.date}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{eventDetails.venue}</span>
          </div>
        </section>

        <section id="register" className="mt-8 grid scroll-mt-6 gap-8 sm:mt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="self-start px-1 sm:px-2 lg:pt-5">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-plum">Registration</p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-.04em] text-ink sm:text-4xl">
              Your place starts here.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/75 sm:text-base">
              Send 500 birr to either account. Then upload a screenshot of your payment receipt with your registration.
            </p>

            <div className="mt-6 divide-y divide-plum/20 border-y border-plum/20">
              <div className="py-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-plum">CBE</p>
                <p className="mt-1 break-all text-lg font-bold tracking-wide text-ink">1000099530352</p>
                <p className="mt-1 text-sm text-ink/70">YONATAN DERIBE</p>
              </div>
              <div className="py-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-plum">Telebirr</p>
                <p className="mt-1 text-lg font-bold tracking-wide text-ink">091 523 4729</p>
                <p className="mt-1 text-sm text-ink/70">YONATAN DERIBE</p>
              </div>
            </div>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-plum">
              <ArrowDown className="h-4 w-4" /> Complete your details below
            </p>
          </div>

          <RegistrationForm />
        </section>

        <footer className="mt-10 border-t border-plum/20 py-5 text-center text-xs text-ink/70 sm:flex sm:items-center sm:justify-between sm:text-left">
          <p>{eventDetails.shortOrganizer} · A community gathered in gratitude.</p>
          <p className="mt-2 sm:mt-0">{eventDetails.venue} · {eventDetails.date}</p>
        </footer>
      </div>
    </main>
  );
}
