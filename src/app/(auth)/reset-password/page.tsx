import Link from "next/link";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Νέος κωδικός" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Νέος κωδικός</h1>
        <p className="mt-1 text-sm text-slate-600">Διάλεξε έναν νέο κωδικό για τον λογαριασμό σου.</p>

        <ResetForm />

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/forgot-password" className="font-medium text-brand-700 hover:text-brand-900">
            Ο σύνδεσμος έληξε; Ζήτησε νέο
          </Link>
        </p>
      </div>
    </div>
  );
}
