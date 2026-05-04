"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, FormError } from "@/components/admin/Field";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Subject } from "@/types/database";

export function SubjectForm({ item }: { item: Subject | null }) {
  const action = saveResource.bind(null, "subjects", item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Όνομα"     name="name"  defaultValue={item?.name}  required />
      <Field label="Slug"      name="slug"  defaultValue={item?.slug}  required />
      <Field label="Icon (emoji)" name="icon" defaultValue={item?.icon} placeholder="📚" />
      <Field label="Σειρά"     name="order" type="number" defaultValue={item?.order ?? 0} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/subjects" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {item && <DeleteButton id={item.id} title={item.name} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "subjects", id);
  return (
    <button type="submit" formAction={action}
        onClick={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}
        className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
  );
}
