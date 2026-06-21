"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/(auth)/actions";

type Section = {
  label: string;
  links: { href: string; label: string }[];
};

const SECTIONS: Section[] = [
  {
    label: "Πρόγραμμα Σπουδών",
    links: [
      { href: "/gimnasio", label: "Γυμνάσιο" },
      { href: "/alikeiou", label: "Α' Λυκείου" },
      { href: "/blikeiou", label: "Β' Λυκείου" },
      { href: "/glikeiou", label: "Γ' Λυκείου & Πανελλήνιες" },
      { href: "/epal",     label: "ΕΠΑΛ" },
    ],
  },
  {
    label: "Υπηρεσίες",
    links: [
      { href: "/online-mathimata", label: "Online μαθήματα" },
      { href: "/courses",          label: "Μαθήματα" },
      { href: "/epaggelmatikos-prosanatolismos", label: "Επαγγελματικός Προσανατολισμός" },
      { href: "/ergaleia",         label: "Διαδραστικά Εργαλεία" },
    ],
  },
  {
    label: "Πληροφορίες",
    links: [
      { href: "/blog",        label: "Blog" },
      { href: "/events",      label: "Εκδηλώσεις" },
      { href: "/gallery",     label: "Φωτογραφίες" },
      { href: "/martyries",   label: "Μαρτυρίες" },
      { href: "/gia-emas",    label: "Για εμάς" },
      { href: "/synergates",  label: "Συνεργάτες" },
      { href: "/epikoinonia", label: "Επικοινωνία" },
    ],
  },
];

export function MobileMenu({ user, role }: { user: { email: string } | null; role: string | null }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Άνοιγμα μενού"
        className="rounded-md p-2 text-slate-100 hover:bg-white/10 lg:hidden"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Κλείσιμο μενού"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#1f3a5f] px-5 py-4 text-white">
              <span className="text-lg font-semibold tracking-tight">Μενού</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Κλείσιμο"
                className="rounded-md p-1.5 hover:bg-white/10"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {SECTIONS.map((s) => (
                <div key={s.label} className="mb-6">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                    {s.label}
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {s.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-2.5 text-base font-medium text-slate-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    Ο λογαριασμός μου
                  </Link>
                  {role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      Διαχείριση
                    </Link>
                  )}
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Αποσύνδεση
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-amber-400"
                >
                  Σύνδεση
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
