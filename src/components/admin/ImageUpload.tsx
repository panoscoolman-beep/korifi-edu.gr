"use client";

import { useState, useRef } from "react";
import Image from "next/image";

/**
 * Image upload widget. Stores the URL into a hidden form field (`name`).
 * Uploads via /api/admin/upload-image which writes to Supabase Storage `images` bucket.
 */
export function ImageUpload({
  name, label, defaultUrl,
}: { name: string; label: string; defaultUrl?: string | null }) {
  const [url,    setUrl]    = useState<string | null>(defaultUrl ?? null);
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null); setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input type="hidden" name={name} value={url ?? ""} />

      <div
        className="mt-1 flex items-start gap-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-slate-200">
          {url ? (
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-slate-300">🖼️</div>
          )}
        </div>

        <div className="flex-1 text-sm">
          <input
            ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <button
            type="button" disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy ? "Ανέβασμα…" : url ? "Αλλαγή" : "Επιλογή εικόνας"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl(null)}
              className="ml-2 text-xs text-red-700 hover:text-red-900"
            >
              Αφαίρεση
            </button>
          )}
          <p className="mt-1 text-xs text-slate-500">Drag & drop εικόνας ή κλικ. Ανεβαίνει στο Supabase Storage.</p>
          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
          {url && <p className="mt-1 break-all text-xs text-slate-400">{url}</p>}
        </div>
      </div>
    </div>
  );
}
