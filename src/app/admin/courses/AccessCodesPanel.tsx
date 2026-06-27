"use client";

import { useActionState, useState } from "react";
import { generateAccessCode, deleteAccessCode } from "./codeActions";
import type { CourseAccessCode } from "@/types/database";

/**
 * Admin panel for managing course access codes.
 * Renders below the course edit form on /admin/courses/[id].
 */
export function AccessCodesPanel({
  courseId, codes,
}: {
  courseId: string;
  codes: CourseAccessCode[];
}) {
  const [state, formAction, pending] = useActionState(generateAccessCode, null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  return (
    <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Κωδικοί πρόσβασης</h2>
      <p className="mt-1 text-sm text-slate-600">
        Δημιούργησε έναν κωδικό και δώσε τον στους μαθητές σου. Όταν τον εισάγουν στη σελίδα του μαθήματος εγγράφονται αυτόματα.
      </p>

      <form action={formAction} className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <input type="hidden" name="course_id" value={courseId} />
        <div className="sm:col-span-3">
          <label htmlFor="ac-description" className="block text-xs font-medium text-slate-600">Σχόλιο (προαιρετικό)</label>
          <input
            id="ac-description" name="description" type="text" placeholder="π.χ. Α' Λυκείου, τμήμα Δευτέρας"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="ac-max-uses" className="block text-xs font-medium text-slate-600">Μέγιστες χρήσεις</label>
          <input
            id="ac-max-uses" name="max_uses" type="number" min="1" placeholder="απεριόριστο"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="ac-expires-at" className="block text-xs font-medium text-slate-600">Λήξη (προαιρετικό)</label>
          <input
            id="ac-expires-at" name="expires_at" type="date"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit" disabled={pending}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Δημιουργία…" : "+ Νέος κωδικός"}
          </button>
        </div>
        {state?.error && (
          <p className="sm:col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.code && (
          <div className="sm:col-span-3 rounded-md border-2 border-emerald-300 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-medium text-emerald-700">Νέος κωδικός — αντίγραψέ τον τώρα:</p>
            <div className="mt-1 flex items-center gap-3">
              <code className="rounded bg-white px-3 py-1.5 font-mono text-lg font-bold text-emerald-900 ring-1 ring-emerald-200">
                {state.code}
              </code>
              <button type="button" onClick={() => copy(state.code!, "new")}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-900">
                {copiedId === "new" ? "✓ Αντιγράφηκε" : "Αντιγραφή"}
              </button>
            </div>
          </div>
        )}
      </form>

      {codes.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Δεν έχουν δημιουργηθεί κωδικοί ακόμα.
        </p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2 text-left">Κωδικός</th>
              <th className="py-2 text-left">Σχόλιο</th>
              <th className="py-2 text-left">Χρήσεις</th>
              <th className="py-2 text-left">Λήξη</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {codes.map((c) => (
              <tr key={c.id}>
                <td className="py-2.5">
                  <button
                    type="button"
                    onClick={() => copy(c.code, c.id)}
                    title="Αντιγραφή"
                    className="font-mono text-base font-semibold text-slate-900 hover:text-brand-700"
                  >
                    {copiedId === c.id ? "✓" : c.code}
                  </button>
                </td>
                <td className="py-2.5 text-slate-600">{c.description ?? "—"}</td>
                <td className="py-2.5 text-slate-600">
                  {c.uses_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="py-2.5 text-slate-600">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString("el-GR") : "—"}
                </td>
                <td className="py-2.5 text-right">
                  <form>
                    <button
                      type="submit"
                      formAction={async () => { await deleteAccessCode(c.id, courseId); }}
                      onClick={(e) => { if (!confirm(`Διαγραφή του κωδικού ${c.code};`)) e.preventDefault(); }}
                      className="text-xs text-red-700 hover:text-red-900"
                    >
                      Διαγραφή
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
