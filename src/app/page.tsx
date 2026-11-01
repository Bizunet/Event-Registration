import { ArrowDown, ArrowUpRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import RegistrationForm from "@/components/registration-form";
import { eventDetails } from "@/lib/event";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="DDUECSF home">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-maroon text-xs font-black tracking-tight text-cream">DDU</span>
          <span className="text-sm font-bold tracking-[.13em] text-ink">DDUECSF</span>
        </a>
        <a href="#register" className="rounded-full border border-maroon/25 px-5 py-2.5 text-sm font-bold text-maroon transition hover:bg-maroon hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon">
          Get your pass <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </a>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-10 sm:px-8 md:grid-cols-[1.15fr_.85fr] md:items-center md:pb-28 md:pt-16">
        <div className="absolute -left-40 top-12 h-96 w-96 rounded-full bg-maroon/10 blur-3xl" />
        <div className="relative">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-blush px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-maroon shadow-sm">
            <Sparkles className="h-4 w-4 text-accent" /> A night of gratitude &amp; fellowship
          </div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[.22em] text-accent">You&apos;re warmly invited</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-.055em] text-ink sm:text-6xl lg:text-7xl">
            100 Days Left <span className="font-display font-medium italic text-maroon">Overnight</span> Thanksgiving Program
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink/75">
            Come together for an unforgettable night of worship, gratitude, and community. There&apos;s a place for you here.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blush px-4 py-3 text-sm font-semibold text-ink shadow-sm">
              <CalendarDays className="h-4 w-4 text-maroon" /> {eventDetails.date}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blush px-4 py-3 text-sm font-semibold text-ink shadow-sm">
              <MapPin className="h-4 w-4 text-maroon" /> {eventDetails.venue}
            </div>
          </div>
          <p className="mt-8 text-sm text-ink/70">Hosted with love by <span className="font-bold text-ink">{eventDetails.organizer}</span></p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="grain absolute -right-7 -top-7 h-32 w-32 rounded-full bg-gold/25" />
          <div className="relative overflow-hidden rounded-[2rem] bg-maroon p-8 text-cream shadow-2xl shadow-maroon/25 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/15" />
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/15" />
            <div className="relative flex h-full min-h-[310px] flex-col justify-between">
              <div>
                <span className="mb-10 inline-flex rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-white/85">DDUECSF presents</span>
                <div className="text-sm font-bold uppercase tracking-[.18em] text-gold">100 days left</div>
                <h2 className="mt-3 max-w-xs text-4xl font-black leading-[1.05] tracking-[-.04em]">A night to give thanks.</h2>
                <p className="mt-4 max-w-xs text-sm leading-6 text-white/85">Gather in joy. Celebrate in faith. Make memories together.</p>
              </div>
              <div className="mt-10 flex items-end justify-between border-t border-white/20 pt-5">
                <div><p className="text-[10px] uppercase tracking-[.2em] text-white/70">When</p><p className="mt-1 font-bold">{eventDetails.date}</p></div>
                <div className="text-right"><p className="text-[10px] uppercase tracking-[.2em] text-white/70">Where</p><p className="mt-1 font-bold">{eventDetails.venue}</p></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 grid h-16 w-16 place-items-center rounded-2xl bg-gold text-ink shadow-xl">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>
      </section>

      <section id="register" className="relative bg-blush px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div className="md:sticky md:top-12 md:self-start">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Save your spot</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] text-ink sm:text-5xl">Your night of gratitude starts here.</h2>
            <p className="mt-5 max-w-md leading-7 text-ink/75">Register with your student details to receive your personal digital event pass. Keep it handy for the celebration.</p>
            <div className="mt-10 flex items-center gap-3 text-sm font-bold text-maroon"><ArrowDown className="h-4 w-4" /> Complete your registration</div>
            <a href="/admin/guests" className="mt-12 inline-block text-xs font-semibold text-ink/65 transition hover:text-maroon">Organizer access</a>
          </div>
          <RegistrationForm />
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-3 bg-ink px-5 py-8 text-center text-xs text-white/75 sm:flex-row sm:px-8">
        <p>{eventDetails.shortOrganizer} · A community gathered in gratitude.</p>
        <p>{eventDetails.venue} · {eventDetails.date}</p>
      </footer>
    </main>
  );
}
