"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { Event as EventType } from "@/types/database";

export function EventForm({ event }: { event: EventType | null }) {
  const action = saveResource.bind(null, "events", event?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Slug" name="slug" defaultValue={event?.slug} required />
      <Field label="Τίτλος" name="title" defaultValue={event?.title} required />
      <ImageUpload name="cover_image" label="Cover image" defaultUrl={event?.cover_image} />
      <MarkdownEditor name="description_md" label="Περιγραφή" defaultValue={event?.description_md} rows={10} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Έναρξη" name="starts_at" type="datetime-local" defaultValue={event?.starts_at?.slice(0,16)} />
        <Field label="Λήξη"   name="ends_at"   type="datetime-local" defaultValue={event?.ends_at?.slice(0,16)} />
      </div>

      <Field label="Τοποθεσία"   name="location" defaultValue={event?.location} placeholder="π.χ. Καλλονή Λέσβου" />
      <Field label="Σύνδεσμος (αν online)" name="link_url" defaultValue={event?.link_url} placeholder="https://zoom.us/..." />
      <Toggle label="Online εκδήλωση" name="is_online"    defaultChecked={event?.is_online ?? false} />
      <Toggle label="Δημοσιευμένη"    name="is_published" defaultChecked={event?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{pending ? "…" : "Αποθήκευση"}</button>
          <Link href="/admin/events" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
        </div>
        {event && <DeleteButton id={event.id} title={event.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "events", id);
  return (
    <button type="submit" formAction={action}
        onClick={(e) => { if (!confirm(`Σίγουρα διαγραφή "${title}";`)) e.preventDefault(); }}
        className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
  );
}
