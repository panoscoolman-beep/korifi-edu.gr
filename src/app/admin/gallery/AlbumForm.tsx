"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, TextArea, Toggle, FormError } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveResource, deleteResource } from "@/app/admin/actions";
import type { GalleryAlbum } from "@/types/database";

export function AlbumForm({ album }: { album: GalleryAlbum | null }) {
  const action = saveResource.bind(null, "gallery_albums", album?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Slug" name="slug" defaultValue={album?.slug} required hint="URL: /gallery/<slug>" />
      <Field label="Τίτλος" name="title" defaultValue={album?.title} required />
      <TextArea label="Περιγραφή" name="description" defaultValue={album?.description} rows={3} />
      <ImageUpload name="cover_image" label="Cover image" defaultUrl={album?.cover_image} />
      <Field label="Ημερομηνία εκδήλωσης" name="event_date" type="date" defaultValue={album?.event_date?.slice(0,10)} />
      <Field label="Σειρά εμφάνισης" name="sort_order" type="number" defaultValue={album?.sort_order ?? 0} />
      <Toggle label="Δημοσιευμένο" name="is_published" defaultChecked={album?.is_published ?? false} />

      <FormError message={state?.error} />

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {pending ? "…" : "Αποθήκευση"}
          </button>
          <Link href="/admin/gallery" className="text-sm text-slate-600 hover:text-slate-900">Άκυρο</Link>
          {album && (
            <a href={`/gallery/${album.slug}`} target="_blank" rel="noopener" className="text-sm text-brand-700 hover:text-brand-900">
              Προβολή live →
            </a>
          )}
        </div>
        {album && <DeleteButton id={album.id} title={album.title} />}
      </div>
    </form>
  );
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const action = deleteResource.bind(null, "gallery_albums", id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(`Σίγουρα διαγραφή του άλμπουμ "${title}";`)) e.preventDefault(); }}>
      <button type="submit" className="text-sm text-red-700 hover:text-red-900">Διαγραφή</button>
    </form>
  );
}
