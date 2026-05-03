"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Teacher } from "@/types/database";

export function TeacherGrid({ teachers }: { teachers: Teacher[] }) {
  const [active, setActive] = useState<Teacher | null>(null);

  // Close on Escape, lock body scroll while open
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setActive(t)}
              className="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
              aria-label={`Δείτε βιογραφικό: ${t.full_name}`}
            >
              <div className="relative aspect-square w-full bg-slate-100">
                {t.photo_url ? (
                  <Image
                    src={t.photo_url}
                    alt={t.full_name}
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-slate-300">👤</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold tracking-wide text-slate-900 group-hover:text-brand-700">
                  {t.full_name}
                </h3>
                {t.role && (
                  <p className="mt-1 text-sm text-brand-700">{t.role}</p>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  Δες βιογραφικό →
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {active && <TeacherModal teacher={active} onClose={() => setActive(null)} />}
    </>
  );
}

function TeacherModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
          aria-label="Κλείσιμο"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="grid sm:grid-cols-[200px_1fr]">
          <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100">
            {teacher.photo_url ? (
              <Image
                src={teacher.photo_url}
                alt={teacher.full_name}
                fill
                sizes="(min-width: 640px) 200px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-slate-300">👤</div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h2 id="teacher-modal-title" className="text-xl font-semibold tracking-wide text-slate-900">
              {teacher.full_name}
            </h2>
            {teacher.role && (
              <p className="mt-1 text-sm font-medium text-brand-700">{teacher.role}</p>
            )}

            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Βιογραφικό</p>
              {teacher.bio_md && teacher.bio_md.trim() ? (
                <div className="prose prose-sm prose-slate mt-3 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{teacher.bio_md}</ReactMarkdown>
                </div>
              ) : (
                <p className="mt-3 text-sm italic text-slate-500">
                  Το βιογραφικό συμπληρώνεται σύντομα.
                </p>
              )}
            </div>

            {teacher.email && (
              <a
                href={`mailto:${teacher.email}`}
                className="mt-6 inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-900"
              >
                ✉️ {teacher.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
