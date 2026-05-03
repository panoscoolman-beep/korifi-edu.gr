import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Επαναφορά κωδικού" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Επαναφορά κωδικού</h1>
        <p className="mt-1 text-sm text-slate-600">Δώσε το email σου και θα σου στείλουμε σύνδεσμο επαναφοράς.</p>

        <ForgotForm />

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-900">
            ← Πίσω στη σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}
