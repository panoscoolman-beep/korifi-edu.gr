import { SubjectForm } from "../SubjectForm";

export const metadata = { title: "Νέα τάξη" };

export default function NewSubject() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέα τάξη</h1>
      <SubjectForm item={null} />
    </div>
  );
}
