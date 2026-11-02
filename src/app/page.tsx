import Image from "next/image";
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import RegistrationForm from "@/components/registration-form";
import { eventDetails } from "@/lib/event";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sky-gradient text-[#0b2f2d]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[1.75rem] bg-[#0b5d57] px-4 py-4 shadow-[0_18px_45px_rgba(9,44,42,0.18)] sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-3" aria-label="DDUECSF home">
              <Image src="/dduecsf-logo.png" alt="DDUECSF logo" width={42} height={42} className="h-9 w-9 object-contain sm:h-10 sm:w-10" priority />
              <span className="text-sm font-bold tracking-[.12em] text-[#f5efe6]">DDUECSF</span>
            </a>

            <nav className="hidden items-center gap-6 text-[11px] font-medium text-[#dfe9e7] md:flex">
              <a href="#" className="transition hover:text-white">Home</a>
              <a href="#" className="transition hover:text-white">About</a>
              <a href="#" className="transition hover:text-white">Services</a>
              <a href="#" className="transition hover:text-white">Pricing</a>
              <a href="#" className="transition hover:text-white">Contact</a>
            </nav>

            <a href="#register" className="inline-flex items-center gap-2 rounded-full bg-[#f0bf53] px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#0d2725] shadow-lg shadow-[#0d2725]/10 transition hover:brightness-105 sm:text-xs">
              Get Started <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-[#0b5d57] px-4 pb-6 pt-6 shadow-[0_20px_45px_rgba(9,44,42,0.18)] sm:px-6 sm:pb-8 lg:px-8 lg:pt-8">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-8 top-10 h-44 w-44 rounded-full border border-[#d9f2ef]/20" />
            <div className="absolute -right-12 top-5 h-52 w-52 rounded-full border border-[#d9f2ef]/15" />
            <div className="absolute -right-4 bottom-12 h-72 w-72 rounded-full border border-[#d9f2ef]/10" />
            <div className="absolute left-1/2 top-20 h-16 w-16 rounded-full bg-[#d7d0c3] opacity-20 blur-2xl" />
          </div>

          <div className="relative">
            <div className="py-2 lg:py-6">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0f726b]/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#f7f3ec]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f0bf53] text-[9px] text-[#0d2725]">★</span>
                DDUECSF presents
              </div>

              <h1 className="max-w-xl text-[clamp(2.7rem,5vw,5.2rem)] font-black leading-[0.95] tracking-[-.06em] text-[#f3eee6]">
                100 Days Left
                <span className="mt-3 block text-[#f4f0ea]">A night to give thanks.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#dfe9e7] sm:text-lg">
                Gather in joy. Celebrate in faith. Make memories together in an unforgettable overnight fellowship experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#f1eadf] px-3 py-2.5 text-xs font-semibold text-[#0d2725] sm:text-sm">
                  <CalendarDays className="h-4 w-4 text-[#0b5d57]" />
                  {eventDetails.date}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#f1eadf] px-3 py-2.5 text-xs font-semibold text-[#0d2725] sm:text-sm">
                  <MapPin className="h-4 w-4 text-[#0b5d57]" />
                  {eventDetails.venue}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="register" className="mt-10 rounded-[2rem] bg-[#f4efe9] px-4 py-6 shadow-[0_18px_40px_rgba(9,44,42,0.08)] sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="pt-4">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0b5d57]/20 bg-[#edf5f3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#0b5d57]">
                <span className="h-2 w-2 rounded-full bg-[#f0bf53]" />
                Registration
              </div>
              <h2 className="text-3xl font-black tracking-[-.05em] text-[#0b2f2d] sm:text-4xl lg:text-5xl">
                Your night of gratitude starts here.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-[#4f615f]">
                Register to claim your spot and keep your personal digital pass ready for the event.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm font-bold text-[#0b5d57]">
                <ArrowDown className="h-4 w-4" /> Complete your registration
              </div>
            </div>

            <div className="lg:pl-2">
              <RegistrationForm />
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-[#0b5d57]/10 bg-[#0b5d57] px-4 py-5 text-center text-xs text-[#edf7f6] sm:text-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{eventDetails.shortOrganizer} · A community gathered in gratitude.</p>
          <p>{eventDetails.venue} · {eventDetails.date}</p>
        </div>
      </footer>
    </main>
  );
}
