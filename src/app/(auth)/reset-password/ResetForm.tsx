"use client";

import { useActionState } from "react";
import { updatePassword } from "../actions";
import { PASSWORD_HINT } from "@/lib/password";

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Νέος κωδικός</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">{PASSWORD_HINT}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">Επανάληψη κωδικού</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={10} className={inputClass} />
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Αποθήκευση..." : "Αποθήκευση κωδικού"}
      </button>
    </form>
  );
}
