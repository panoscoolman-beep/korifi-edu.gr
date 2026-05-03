"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, Select, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Course, Subject } from "@/types/database";

export function CourseForm({ course, subjects }: { course: Course | null; subjects: Subject[] }) {
  const action = saveResource.bind(null, "courses", course?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Τίτλος" name="title" defaultValue={course?.title} required />
      <Field label="Slug"   name="slug"  defaultValue={course?.slug}  required />
      <Select label="Τάξη" name="subject_id" defaultValue={course?.subject_id} required
        options={[
          { value: "", label: "— Επιλέξτε —" },
          ...subjects.map((s) => ({ value: s.id, label: s.name })),
        ]} />
      <TextArea label="Περιγραφή" name="description" defaultValue={course?.description} rows={4} />
      <ImageUpload name="cover_image" label="Cover image" defaultUrl={course?.cover_image} />
      <Toggle label="Δωρεάν" name="is_free" defaultChecked={course?.is_free ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/courses" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {course && <DeleteButton id={course.id} title={course.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "courses", id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}>
      <button type="submit" className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
    </form>
  );
}
