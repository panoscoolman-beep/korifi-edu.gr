"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { redeemAccessCode } from "@/app/admin/courses/codeActions";

/**
 * Code redemption form shown on /courses/[slug] when the user is logged in
 * but not yet enrolled. On success, refreshes the route so the lesson list
 * reveals.
 */
export function RedeemCodeForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(redeemAccessCode, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          🔒 Προστατευμένο περιεχόμενο
        </p>
        <h3 className="mt-1 text-xl font-bold text-slate-900">Έχεις κωδικό πρόσβασης;</h3>
        <p className="mt-2 text-sm text-slate-600">
          Εισήγαγε τον κωδικό που σου έδωσε ο καθηγητής σου για να δεις το υλικό του μαθήματος.
        </p>
      </div>

      <input type="hidden" name="course_id" value={courseId} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="code"
          type="text"
          autoComplete="off"
          required
          placeholder="ABC23XYZ"
          maxLength={32}
          className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-center font-mono text-lg font-semibold uppercase tracking-widest text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Έλεγχος…" : "Ξεκλείδωμα"}
        </button>
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
