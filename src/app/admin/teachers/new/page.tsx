import { TeacherForm } from "../TeacherForm";

export const metadata = { title: "Νέος καθηγητής" };

export default function NewTeacher() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέος καθηγητής</h1>
      <TeacherForm teacher={null} />
    </div>
  );
}
