"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { addPhotoToAlbum, deletePhoto } from "@/app/admin/actions";
import type { GalleryPhoto } from "@/types/database";

export function PhotoManager({
  albumId, photos: initial,
}: { albumId: string; photos: GalleryPhoto[] }) {
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });

    for (const [i, file] of list.entries()) {
      try {
        const form = new FormData();
        form.append("file", file);
        const res  = await fetch("/api/admin/upload-image", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "upload failed");
        await new Promise<void>((resolve) =>
          startTransition(async () => {
            await addPhotoToAlbum(albumId, json.url, file.name.replace(/\.[^.]+$/, ""));
            resolve();
          })
        );
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : e}`);
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setProgress(null);
    // Server action revalidatePath should refresh the list — fall back to a manual reload
    window.location.reload();
  }

  function onDelete(p: GalleryPhoto) {
    if (!confirm("Διαγραφή φωτογραφίας;")) return;
    startTransition(async () => {
      try { await deletePhoto(p.id, albumId); window.location.reload(); }
      catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    });
  }

  return (
    <div>
      <div
        className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); }}
        />
        <p className="text-sm text-slate-700">
          Σύρε εδώ φωτογραφίες ή{" "}
          <button
            type="button" onClick={() => inputRef.current?.click()}
            className="font-medium text-brand-700 underline hover:text-brand-900"
          >
            επίλεξε αρχεία
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-500">JPG/PNG/WebP, έως 8MB ανά αρχείο. Δεκάδες ταυτόχρονα.</p>

        {progress && (
          <p className="mt-3 text-xs font-medium text-brand-700">
            Ανέβασμα {progress.done}/{progress.total}…
          </p>
        )}
        {busy && !progress && <p className="mt-3 text-xs text-slate-500">Αποθήκευση…</p>}
        {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      </div>

      {initial.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">Δεν υπάρχουν φωτογραφίες ακόμα.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {initial.map((p) => (
            <li key={p.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="relative aspect-square w-full bg-slate-100">
                <Image src={p.image_url} alt={p.caption ?? ""} fill sizes="(min-width: 1024px) 200px, 50vw" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onDelete(p)}
                disabled={busy}
                className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white group-hover:flex"
                aria-label="Διαγραφή"
              >
                ✕
              </button>
              {p.caption && <p className="truncate px-2 py-1 text-xs text-slate-600">{p.caption}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
