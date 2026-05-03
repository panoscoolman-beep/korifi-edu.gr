"use client";

import { useActionState } from "react";
import { sendPasswordReset } from "../actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState(sendPasswordReset, null);

  if (state?.ok) {
    return (
      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        ✓ {state.ok}
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input
          id="email" name="email" type="email" autoComplete="email" required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Αποστολή..." : "Αποστολή συνδέσμου"}
      </button>
    </form>
  );
}
