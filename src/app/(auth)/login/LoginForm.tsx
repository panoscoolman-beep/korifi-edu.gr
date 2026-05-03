"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithPassword, signInWithGoogle } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInWithPassword, null);

  return (
    <>
      <form action={signInWithGoogle} className="mt-6">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Σύνδεση με Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
        <div className="flex-1 border-t border-slate-200" />
        ή
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/dashboard"} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Κωδικός</label>
            <Link href="/forgot-password" className="text-xs text-brand-700 hover:text-brand-900">
              Ξέχασες τον κωδικό;
            </Link>
          </div>
          <input
            id="password" name="password" type="password" autoComplete="current-password" required
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
          {pending ? "Σύνδεση..." : "Σύνδεση"}
        </button>
      </form>
    </>
  );
}
