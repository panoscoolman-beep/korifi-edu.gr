"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Article } from "@/types/database";

export function ArticleForm({ article }: { article: Article | null }) {
  const action = saveResource.bind(null, "articles", article?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  const todayIso = article?.published_at ?? new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Slug" name="slug" defaultValue={article?.slug} required hint="URL: /blog/<slug>" />
      <Field label="Τίτλος" name="title" defaultValue={article?.title} required />
      <TextArea label="Excerpt (σύντομη περίληψη)" name="excerpt" defaultValue={article?.excerpt} rows={2} hint="Εμφανίζεται στη λίστα του blog." />
      <ImageUpload name="cover_image" label="Cover image" defaultUrl={article?.cover_image} />
      <Field label="Συγγραφέας" name="author_name" defaultValue={article?.author_name ?? "Παναγιώτης Κουλμανδάς"} />
      <Field label="Ημερομηνία δημοσίευσης" name="published_at" type="date" defaultValue={todayIso.slice(0,10)} />
      <MarkdownEditor name="content_md" label="Άρθρο" defaultValue={article?.content_md} rows={20} />
      <Toggle label="Δημοσιευμένο" name="is_published" defaultChecked={article?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
          <Link href="/admin/articles" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {article && <DeleteButton id={article.id} title={article.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "articles", id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}>
      <button type="submit" className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
    </form>
  );
}
