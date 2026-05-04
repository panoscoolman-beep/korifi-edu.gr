"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Partner } from "@/types/database";

export function PartnerForm({ item }: { item: Partner | null }) {
  const action = saveResource.bind(null, "partners", item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Όνομα" name="name" defaultValue={item?.name} required />
      <ImageUpload name="logo_url" label="Λογότυπο" defaultUrl={item?.logo_url} />
      <Field label="Website URL" name="website_url" type="url" defaultValue={item?.website_url} placeholder="https://..." />
      <Field label="Σειρά εμφάνισης" name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
      <Toggle label="Δημοσιευμένο" name="is_published" defaultChecked={item?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/partners" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {item && <DeleteButton id={item.id} title={item.name} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "partners", id);
  return (
    <button type="submit" formAction={action}
        onClick={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}
        className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
  );
}
