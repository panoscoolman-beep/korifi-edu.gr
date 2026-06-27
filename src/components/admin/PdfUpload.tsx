"use client";

import { useId, useState, useRef } from "react";

export function PdfUpload({
  name, label, defaultUrl,
}: { name: string; label: string; defaultUrl?: string | null }) {
  const [url,    setUrl]    = useState<string | null>(defaultUrl ?? null);
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  async function handleFile(file: File) {
    setError(null); setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/admin/upload-pdf", { method: "POST", body: form });
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
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">{label}</label>
      <input type="hidden" name={name} value={url ?? ""} />

      <div
        className="mt-1 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      >
        <input id={fieldId} ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {url ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <a href={url} target="_blank" rel="noopener" className="flex-1 truncate text-brand-700 hover:underline">
              {decodeURIComponent(url.split("/").pop() ?? "PDF")}
            </a>
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">Αλλαγή</button>
            <button type="button" onClick={() => setUrl(null)} className="text-xs text-red-700 hover:text-red-900">Αφαίρεση</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {busy ? "Ανέβασμα…" : "Επιλογή PDF"}
            </button>
            <span className="text-xs text-slate-500">ή drag & drop εδώ. Μέγιστο 50MB.</span>
          </div>
        )}
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
