"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Teacher } from "@/types/database";

export function TeacherForm({ teacher }: { teacher: Teacher | null }) {
  const action = saveResource.bind(null, "teachers", teacher?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Slug" name="slug" defaultValue={teacher?.slug} required hint="URL-friendly id (μόνο lowercase, παύλες). Δεν αλλάζει αργότερα." />
      <Field label="Ονοματεπώνυμο" name="full_name" defaultValue={teacher?.full_name} required />
      <Field label="Ειδικότητα" name="role" defaultValue={teacher?.role} placeholder="π.χ. ΜΑΘΗΜΑΤΙΚΟΣ" />
      <Field label="Email" name="email" type="email" defaultValue={teacher?.email} />

      <ImageUpload name="photo_url" label="Φωτογραφία" defaultUrl={teacher?.photo_url} />

      <TextArea label="Βιογραφικό (Markdown)" name="bio_md" defaultValue={teacher?.bio_md} rows={6} hint="Συμπληρώνεται προαιρετικά." />

      <Field label="Σειρά εμφάνισης" name="sort_order" type="number" defaultValue={teacher?.sort_order ?? 0} />

      <Toggle label="Δημοσιευμένο" name="is_published" defaultChecked={teacher?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
          <Link href="/admin/teachers" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {teacher && <DeleteButton id={teacher.id} name={teacher.full_name} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const action = deleteResource.bind(null, "teachers", id);
  return (
    <button type="submit" formAction={action}
        onClick={(e) => { if (!confirm(`Σίγουρα διαγραφή "${name}";`)) e.preventDefault(); }}
        className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
  );
}
