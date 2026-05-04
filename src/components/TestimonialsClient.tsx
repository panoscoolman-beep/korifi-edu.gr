"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Testimonial } from "@/types/database";

/**
 * Renders a clickable grid of testimonial cards. Clicking a card opens a
 * modal with the full testimonial body (`full_quote`), falling back to the
 * pull-quote (`quote`) when no long version is stored.
 *
 * Used on:
 *   - the homepage "Τι λένε για εμάς" section (compact: showCount=3)
 *   - the /martyries page (full grid, showCount=undefined)
 */
export function TestimonialsClient({
  items,
  cardSize = "md",
}: {
  items: Testimonial[];
  cardSize?: "sm" | "md";
}) {
  const [active, setActive] = useState<Testimonial | null>(null);

  // Lock body scroll while open + close on Esc
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <ul className={`mt-${cardSize === "sm" ? "8" : "8"} grid gap-${cardSize === "sm" ? "5" : "6"} sm:grid-cols-2 lg:grid-cols-3`}>
        {items.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setActive(t)}
              className={`group flex h-full w-full flex-col rounded-xl border border-brand-100 bg-white text-left ${cardSize === "sm" ? "p-6" : "p-7"} shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md`}
              aria-label={`Διάβασε ολόκληρη τη μαρτυρία του/της ${t.author_name}`}
            >
              <svg
                className={`${cardSize === "sm" ? "h-7 w-7" : "h-8 w-8"} text-amber-400`}
                viewBox="0 0 24 24" fill="currentColor" aria-hidden
              >
                <path d="M7.17 6c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17zm9.66 0c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17z" />
              </svg>

              <p className={`mt-4 flex-1 ${cardSize === "sm" ? "text-sm" : "text-base"} italic leading-relaxed text-slate-700`}>
                {t.quote}
              </p>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  {t.photo_url ? (
                    <Image
                      src={t.photo_url} alt={t.author_name} width={44} height={44}
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-brand-100"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700 ring-2 ring-brand-50">
                      {t.author_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{t.author_name}</p>
                    {t.author_role && <p className="truncate text-xs text-slate-500">{t.author_role}</p>}
                  </div>
                </div>
                {t.full_quote && (
                  <span className="shrink-0 text-xs font-medium text-brand-700 group-hover:text-brand-900">
                    Διάβασε →
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="testimonial-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          <button
            type="button"
            aria-label="Κλείσιμο"
            onClick={() => setActive(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                {active.photo_url ? (
                  <Image
                    src={active.photo_url} alt={active.author_name} width={48} height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-200"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-400 text-lg font-bold text-slate-900">
                    {active.author_name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p id="testimonial-title" className="font-semibold text-slate-900">{active.author_name}</p>
                  {active.author_role && <p className="text-xs text-slate-500">{active.author_role}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Κλείσιμο"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(88vh-5rem)] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <svg className="h-9 w-9 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7.17 6c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17zm9.66 0c-2.86 0-5.17 2.31-5.17 5.17 0 1.65.78 3.13 2 4.07v2.76l3.45-1.83c1.6-.18 2.88-1.46 2.88-3.05V11.17c0-2.86-2.3-5.17-5.16-5.17z" />
              </svg>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-700 sm:text-base">
                {(active.full_quote ?? active.quote).split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
