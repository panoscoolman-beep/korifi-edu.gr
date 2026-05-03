import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Σύνδεση" };

type Search = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: Search }) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Σύνδεση</h1>
        <p className="mt-1 text-sm text-slate-600">Καλώς ήρθες πίσω.</p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <LoginForm next={next} />

        <p className="mt-6 text-center text-sm text-slate-600">
          Νέος στον Κορυφή;{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:text-brand-900">
            Δημιουργία λογαριασμού
          </Link>
        </p>
      </div>
    </div>
  );
}
