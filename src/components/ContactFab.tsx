"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONTACT, DEFAULT_MESSAGE, viberHref, whatsappHref } from "@/lib/site";
import { trackEvent } from "@/lib/track";

/** Σελίδες όπου το κουμπί δεν έχει νόημα (διαχείριση, σύνδεση, υλικό μαθημάτων). */
const HIDDEN_PREFIXES = [
  "/admin", "/dashboard", "/login", "/register",
  "/forgot-password", "/reset-password", "/lessons",
];

/**
 * Σταθερό κουμπί «Μίλα μας» κάτω δεξιά: WhatsApp, Viber, κλήση. Οι γονείς
 * στη Λέσβο γράφουν πιο εύκολα παρά τηλεφωνούν, ειδικά το βράδυ.
 *
 * Μετράει επίσης κάθε κλικ σε `tel:` link οπουδήποτε στη σελίδα (footer,
 * σελίδα επικοινωνίας από τη βάση), ώστε οι κλήσεις να φαίνονται στο
 * /admin/leads χωρίς αλλαγές στο περιεχόμενο.
 */
export function ContactFab() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='tel:']");
      if (a && !a.hasAttribute("data-tracked")) {
        trackEvent("call_click", { path: location.pathname, place: "content" });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const message = `${DEFAULT_MESSAGE} (είδα: korifi-edu.gr${pathname === "/" ? "" : pathname})`;
  const item =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100";

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div
          role="menu"
          aria-label="Επικοινωνία"
          className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Πώς προτιμάς;
          </p>
          <a
            role="menuitem"
            href={whatsappHref(message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_click", { path: pathname, place: "fab" })}
            className={item}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white" aria-hidden="true">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" />
              </svg>
            </span>
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={viberHref()}
            onClick={() => trackEvent("viber_click", { path: pathname, place: "fab" })}
            className={item}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white" aria-hidden="true">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5c-2.4 0-5.6.4-7.4 2.1C3 6.2 2.5 8.6 2.5 11.5c0 2.6.4 5 2 6.6.6.6 1.4 1 2.2 1.3V22l2.7-2.3c.9.1 1.8.1 2.6.1 2.4 0 5.6-.4 7.4-2.1 1.6-1.6 2.1-4 2.1-6.9s-.5-5.3-2.1-6.9C17.6 2.9 14.4 2.5 12 2.5zm3.9 13.1c-.2.6-1.1 1.1-1.6 1.2-.4.1-.9.1-1.5-.1a13 13 0 0 1-4.9-3.4 12.6 12.6 0 0 1-2.5-4.2c-.2-.6-.1-1.2.3-1.7l.6-.6c.3-.3.7-.3 1 0l1.1 1.4c.2.3.2.7 0 1l-.5.6c.4.8 1 1.6 1.6 2.2.6.6 1.4 1.2 2.2 1.6l.6-.5c.3-.2.7-.2 1 0l1.4 1.1c.3.3.3.7.1 1.1l.1.3z" />
              </svg>
            </span>
            Viber
          </a>
          <a
            role="menuitem"
            href={`tel:${CONTACT.phoneE164}`}
            data-tracked
            onClick={() => trackEvent("call_click", { path: pathname, place: "fab" })}
            className={item}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white" aria-hidden="true">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.2 1l-2.3 2.2z" />
              </svg>
            </span>
            Κλήση {CONTACT.phone}
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
      >
        <span aria-hidden="true">{open ? "✕" : "💬"}</span>
        {open ? "Κλείσιμο" : "Μίλα μας"}
      </button>
    </div>
  );
}
