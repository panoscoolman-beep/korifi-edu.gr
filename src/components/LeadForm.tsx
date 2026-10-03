"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead } from "@/app/(public)/leadActions";
import { GRADES } from "@/lib/leads";
import { CONTACT, whatsappHref } from "@/lib/site";
import { trackEvent } from "@/lib/track";

type Props = {
  /** Από ποια σελίδα ήρθε το lead (π.χ. `/courses/algebra-a-lykeiou`). */
  source: string;
  /** Τίτλος της σελίδας, για να ξέρει ο admin τι διάβαζε ο γονιός. */
  sourceLabel?: string;
  /** Προεπιλεγμένη τάξη (από τη λίστα GRADES) ή "" για «διάλεξε». */
  grade?: string;
  /** Προσυμπληρωμένο «μάθημα / τι σε ενδιαφέρει». */
  interest?: string;
  title?: string;
  intro?: string;
};

const INPUT =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

/**
 * Φόρμα «Κλείσε δωρεάν διαγνωστικό» — 4 πεδία, χωρίς λογαριασμό. Αποθηκεύει
 * στο `leads` και ο Πάνος καλεί τον γονιό. Μετράει την υποβολή ως μετατροπή.
 */
export function LeadForm({
  source,
  sourceLabel,
  grade = "",
  interest = "",
  title = "Κλείσε δωρεάν διαγνωστικό",
  intro = "Άφησε το κινητό σου και σε καλούμε εμείς για να κλείσουμε το δωρεάν διαγνωστικό: 30 λεπτά για να δούμε από πού ξεκινάς.",
}: Props) {
  const [state, action, pending] = useActionState(submitLead, null);
  // Πότε άνοιξε η φόρμα — γράφεται απευθείας στο DOM μετά το mount, ώστε ο
  // server να έχει την ίδια τιμή στο SSR (κενό) και να μη διαφέρει το hydration.
  const startedAt = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (state?.ok) trackEvent("lead_submit", { path: source, place: "form" });
  }, [state?.ok, source]);

  const waText = `Γεια σας, θέλω να κλείσω δωρεάν διαγνωστικό.${sourceLabel ? ` (${sourceLabel})` : ""}`;

  return (
    <section
      aria-labelledby="lead-form-title"
      className="mt-12 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8"
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Δωρεάν διαγνωστικό</p>
      <h2 id="lead-form-title" className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{intro}</p>

      {state?.ok ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-semibold">✓ Το λάβαμε!</p>
          <p className="mt-1">
            Θα σε καλέσουμε μέσα στην επόμενη εργάσιμη μέρα για να κλείσουμε μέρα και ώρα.
          </p>
          <p className="mt-3 text-emerald-800">
            Βιάζεσαι;{" "}
            <a
              href={whatsappHref(waText)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { path: source, place: "form-success" })}
              className="font-medium underline underline-offset-2 hover:text-emerald-950"
            >
              Γράψε μας στο WhatsApp
            </a>{" "}
            ή πάρε μας στο{" "}
            <a href={`tel:${CONTACT.phoneE164}`} className="font-medium underline underline-offset-2">
              {CONTACT.phone}
            </a>
            .
          </p>
        </div>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="source_path" value={source} />
          <input type="hidden" name="source_label" value={sourceLabel ?? ""} />
          <input type="hidden" name="started_at" defaultValue="" ref={startedAt} />
          {/* Honeypot — αόρατο για ανθρώπους, το γεμίζουν τα bots. */}
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`website-${source}`}>Website</label>
            <input id={`website-${source}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-name" className="block text-sm font-medium text-slate-700">Όνομα</label>
              <input
                id="lead-name" name="name" type="text" autoComplete="name" required maxLength={80}
                placeholder="π.χ. Μαρία Π."
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="lead-phone" className="block text-sm font-medium text-slate-700">Κινητό</label>
              <input
                id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required
                placeholder="69xxxxxxxx"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="lead-grade" className="block text-sm font-medium text-slate-700">Τάξη</label>
              <select id="lead-grade" name="grade" defaultValue={grade} className={INPUT}>
                <option value="">— διάλεξε —</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lead-interest" className="block text-sm font-medium text-slate-700">
                Μάθημα / τι σε ενδιαφέρει <span className="font-normal text-slate-400">(προαιρετικό)</span>
              </label>
              <input
                id="lead-interest" name="interest" type="text" maxLength={120} defaultValue={interest}
                placeholder="π.χ. Μαθηματικά, Πανελλήνιες, online"
                className={INPUT}
              />
            </div>
          </div>

          {state?.error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit" disabled={pending}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Αποστολή..." : "Θέλω να με καλέσετε"}
            </button>
            <p className="text-xs text-slate-500">
              Τα στοιχεία χρησιμοποιούνται μόνο για να επικοινωνήσουμε μαζί σου. Δεν δίνονται πουθενά.
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
