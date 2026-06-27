"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroSlide = {
  /** Image URL (Supabase Storage, full https URL). */
  image: string;
  /** Alt text for screen readers. */
  alt: string;
  /** Pre-headline kicker (small, uppercase). */
  kicker: string;
  /** Main headline. Use `highlight` to color a fragment. */
  headline: string;
  highlight?: string;
  /** Sub-headline / supporting text. */
  sub?: string;
  /** Primary CTA. */
  cta: { href: string; label: string };
  /** Optional secondary CTA. */
  secondaryCta?: { href: string; label: string };
  /** Tailwind overlay class — subtle gradient over the image. */
  overlayClass?: string;
};

const DEFAULT_OVERLAY = "bg-gradient-to-br from-[#1f3a5f]/85 via-[#1f3a5f]/65 to-amber-700/40";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setActive((i + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setActive((a) => (a - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-900"
      aria-roledescription="carousel"
      aria-label="Φροντιστήριο Κορυφή"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[28rem] w-full sm:h-[32rem] lg:h-[36rem]">
        {slides.map((s, i) => {
          // Only the first slide's headline is a real <h1> — the rest render as
          // <p> so the page has exactly one h1 in the DOM (crawlers read all slides).
          const Headline = i === 0 ? "h1" : "p";
          return (
          <div
            key={i}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === active ? "scale-100 transition-transform duration-[7000ms] ease-out" : "scale-105"}`}
            />
            <div className={`absolute inset-0 ${s.overlayClass ?? DEFAULT_OVERLAY}`} />
            <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-center px-4 text-white sm:px-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200 backdrop-blur-sm sm:text-sm">
                {s.kicker}
              </p>
              <Headline className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-md sm:text-5xl lg:text-6xl">
                {s.headline}
                {s.highlight && (
                  <>
                    {" "}
                    <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                      {s.highlight}
                    </span>
                  </>
                )}
              </Headline>
              {s.sub && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100 drop-shadow-sm sm:text-lg">
                  {s.sub}
                </p>
              )}
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link
                  href={s.cta.href}
                  className="rounded-full bg-amber-300 px-7 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl"
                >
                  {s.cta.label}
                </Link>
                {s.secondaryCta && (
                  <Link
                    href={s.secondaryCta.href}
                    className="rounded-full border-2 border-white/80 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    {s.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          {/* Prev / Next */}
          <button
            type="button"
            onClick={prev}
            aria-label="Προηγούμενη διαφάνεια"
            className="group absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/30 sm:block"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Επόμενη διαφάνεια"
            className="group absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/30 sm:block"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* Dots — each button is a 24×24 tap target (WCAG 2.5.8) with an
              inner visual dot. */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Πήγαινε στη διαφάνεια ${i + 1}`}
                aria-current={i === active}
                className="group flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === active ? "w-8 bg-amber-300" : "w-2 bg-white/50 group-hover:bg-white/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
