"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Page } from "@/types/database";

export function PageForm({ page }: { page: Page | null }) {
  const action = saveResource.bind(null, "pages", page?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Slug" name="slug" defaultValue={page?.slug} required hint="URL path (π.χ. 'gimnasio'). Μη το αλλάξεις σε υπάρχουσες σελίδες — σπάει links." />
      <Field label="Τίτλος" name="title" defaultValue={page?.title} required />

      <ImageUpload name="cover_image" label="Cover image (προαιρετικό)" defaultUrl={page?.cover_image} />

      <TextArea label="Meta description (SEO)" name="meta_description" defaultValue={page?.meta_description} rows={2} hint="Εμφανίζεται στα Google search results." />

      <MarkdownEditor name="content_md" label="Περιεχόμενο" defaultValue={page?.content_md} rows={20} hint="Markdown με υποστήριξη πινάκων. Drag & drop εικόνας για inline." />

      <Field label="Σειρά εμφάνισης" name="sort_order" type="number" defaultValue={page?.sort_order ?? 0} />
      <Toggle label="Δημοσιευμένη" name="is_published" defaultChecked={page?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
          <Link href="/admin/pages" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
          {page && (
            <a href={`/${page.slug}`} target="_blank" rel="noopener" className="text-sm text-brand-700 hover:text-brand-900">
              Προβολή live →
            </a>
          )}
        </div>
        {page && <DeleteButton id={page.id} title={page.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "pages", id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}>
      <button type="submit" className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
    </form>
  );
}
