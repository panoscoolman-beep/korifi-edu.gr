"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, Toggle, Select, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { PdfUpload } from "@/components/admin/PdfUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Lesson, Course } from "@/types/database";

export function LessonForm({ lesson, courses }: { lesson: Lesson | null; courses: Course[] }) {
  const action = saveResource.bind(null, "lessons", lesson?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);
  const [type, setType] = useState<Lesson["content_type"]>(lesson?.content_type ?? "pdf");

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Τίτλος" name="title" defaultValue={lesson?.title} required />
      <Select label="Course" name="course_id" defaultValue={lesson?.course_id} required
        options={[
          { value: "", label: "— Επιλέξτε —" },
          ...courses.map((c) => ({ value: c.id, label: c.title })),
        ]} />
      <Field label="Σειρά" name="order" type="number" defaultValue={lesson?.order ?? 1} />

      <Select label="Τύπος περιεχομένου" name="content_type" defaultValue={type}
        options={[
          { value: "pdf",     label: "PDF" },
          { value: "article", label: "Άρθρο (Markdown)" },
          { value: "text",    label: "Απλό κείμενο" },
        ]}
      />

      {/* show fields based on type */}
      <div onChange={(e) => {
        const t = (e.target as HTMLElement).closest('select[name="content_type"]') as HTMLSelectElement | null;
        if (t) setType(t.value as Lesson["content_type"]);
      }}>
        {type === "pdf" && (
          <PdfUpload name="pdf_url" label="PDF αρχείο" defaultUrl={lesson?.pdf_url} />
        )}
        {(type === "article" || type === "text") && (
          <MarkdownEditor name="content" label="Περιεχόμενο" defaultValue={lesson?.content} rows={16} />
        )}
        {type !== "pdf" && (
          <input type="hidden" name="pdf_url" value={lesson?.pdf_url ?? ""} />
        )}
        {type === "pdf" && (
          <input type="hidden" name="content" value={lesson?.content ?? ""} />
        )}
      </div>

      <ImageUpload name="cover_image" label="Cover image (προαιρετικό)" defaultUrl={lesson?.cover_image} />
      <Toggle label="Δωρεάν" name="is_free" defaultChecked={lesson?.is_free ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/lessons" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {lesson && <DeleteButton id={lesson.id} title={lesson.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "lessons", id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}>
      <button type="submit" className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
    </form>
  );
}
