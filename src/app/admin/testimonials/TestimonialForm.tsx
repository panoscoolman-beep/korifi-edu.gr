"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Testimonial } from "@/types/database";

export function TestimonialForm({ item }: { item: Testimonial | null }) {
  const action = saveResource.bind(null, "testimonials", item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Όνομα" name="author_name" defaultValue={item?.author_name} required />
      <Field label="Ιδιότητα" name="author_role" defaultValue={item?.author_role} placeholder="π.χ. Μαθητής Γ' Λυκείου, Γονέας" />
      <TextArea label="Μαρτυρία" name="quote" defaultValue={item?.quote} rows={4} required />
      <ImageUpload name="photo_url" label="Φωτογραφία (προαιρετικό)" defaultUrl={item?.photo_url} />
      <Field label="Σειρά εμφάνισης" name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
      <Toggle label="Δημοσιευμένη" name="is_published" defaultChecked={item?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/testimonials" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {item && <DeleteButton id={item.id} title={item.author_name} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "testimonials", id);
  return (
    <button type="submit" formAction={action}
        onClick={(e) => { if (!confirm(`Σίγουρα διαγραφή της μαρτυρίας από "${title}";`)) e.preventDefault(); }}
        className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
  );
}
