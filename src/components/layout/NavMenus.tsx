"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/(auth)/actions";

/**
 * Keyboard- & screen-reader-accessible disclosure for the desktop navbar.
 * Replaces the old hover-only (group-hover) dropdowns, which were unreachable
 * without a mouse. Click/Enter toggles; Esc and outside-click close.
 */
function useDisclosure() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

const TRIGGER =
  "flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-amber-300 aria-expanded:bg-white/10 aria-expanded:text-amber-300";
const PANEL = "absolute top-full mt-1 rounded-xl border border-slate-200 bg-white py-2 shadow-lg";
const ITEM =
  "block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 focus:bg-brand-50 focus:text-brand-700 focus:outline-none";

type NavLinkItem = { href: string; label: string };

export function NavDropdown({
  label, links, align = "left",
}: { label: string; links: NavLinkItem[]; align?: "left" | "right" }) {
  const { open, setOpen, ref } = useDisclosure();
  const id = useId();
  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={TRIGGER}
      >
        {label}
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div id={id} className={`${PANEL} ${align === "right" ? "right-0 w-48" : "left-0 w-56"}`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={ITEM}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountMenu({ email, role }: { email: string; role: string | null }) {
  const { open, setOpen, ref } = useDisclosure();
  const id = useId();
  return (
    <div ref={ref} className="relative ml-2 hidden lg:block">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        aria-label="Ο λογαριασμός μου"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1.5c-2.4 0-7 1.2-7 3.5V14h14v-1c0-2.3-4.6-3.5-7-3.5z" />
        </svg>
        <span className="hidden sm:inline">{email.split("@")[0]}</span>
      </button>
      {open && (
        <div id={id} className={`${PANEL} right-0 w-56`}>
          <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500">{email}</div>
          <Link href="/dashboard" onClick={() => setOpen(false)} className={ITEM}>
            Ο λογαριασμός μου
          </Link>
          {role === "admin" && (
            <Link href="/admin" onClick={() => setOpen(false)} className={ITEM}>
              Διαχείριση
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-700">
              Αποσύνδεση
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
