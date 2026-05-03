import { PageForm } from "../PageForm";

export const metadata = { title: "Νέα σελίδα" };

export default function NewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέα σελίδα</h1>
      <PageForm page={null} />
    </div>
  );
}
