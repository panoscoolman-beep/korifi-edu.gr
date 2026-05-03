import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Δημιουργία λογαριασμού" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Δημιουργία λογαριασμού</h1>
        <p className="mt-1 text-sm text-slate-600">Φτιάξε λογαριασμό μαθητή σε ένα λεπτό.</p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-slate-600">
          Έχεις ήδη λογαριασμό;{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-900">
            Σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}
