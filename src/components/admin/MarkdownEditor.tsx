"use client";

import { useId, useState, useRef, useTransition } from "react";

/**
 * Simple markdown editor: textarea + toolbar + live preview tab.
 * Inline image upload via /api/admin/upload-image inserts ![alt](url).
 */
export function MarkdownEditor({
  name, label, defaultValue, hint, rows = 16,
}: { name: string; label: string; defaultValue?: string | null; hint?: string; rows?: number }) {
  const [tab,    setTab]    = useState<"write"|"preview">("write");
  const [value,  setValue]  = useState(defaultValue ?? "");
  const [previewHtml, setPreviewHtml] = useState("");
  const [busy, startTransition] = useTransition();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  function insert(before: string, after = "") {
    const ta = taRef.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    setValue(next);
    queueMicrotask(() => {
      ta.focus();
      const pos = start + before.length + sel.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function uploadImageAndInsert(file: File) {
    const form = new FormData(); form.append("file", file);
    const res  = await fetch("/api/admin/upload-image", { method: "POST", body: form });
    const json = await res.json();
    if (res.ok) insert(`![](${json.url})`);
    else        alert(`Upload failed: ${json.error}`);
  }

  async function loadPreview() {
    setTab("preview");
    startTransition(async () => {
      const res = await fetch("/api/admin/preview-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: value }),
      });
      if (res.ok) setPreviewHtml(await res.text());
      else        setPreviewHtml("<p>Preview error</p>");
    });
  }

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">{label}</label>
      <input type="hidden" name={name} value={value} />

      <div className="mt-1 overflow-hidden rounded-md border border-slate-300">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1">
          <div className="flex gap-1">
            <TabBtn active={tab==="write"}   onClick={() => setTab("write")}>Γραφή</TabBtn>
            <TabBtn active={tab==="preview"} onClick={loadPreview}>Προεπισκόπηση</TabBtn>
          </div>
          {tab === "write" && <Toolbar insert={insert} fileRef={fileRef} />}
        </div>

        {/* Body */}
        {tab === "write" ? (
          <textarea
            id={fieldId}
            ref={taRef} rows={rows} value={value}
            onChange={(e) => setValue(e.target.value)}
            onPaste={(e) => {
              const file = Array.from(e.clipboardData?.items ?? [])
                .map((i) => i.getAsFile())
                .find((f): f is File => !!f && f.type.startsWith("image/"));
              if (file) { e.preventDefault(); uploadImageAndInsert(file); }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const file = Array.from(e.dataTransfer.files ?? []).find((f) => f.type.startsWith("image/"));
              if (file) { e.preventDefault(); uploadImageAndInsert(file); }
            }}
            className="block w-full resize-y border-0 px-3 py-3 font-mono text-xs text-slate-900 focus:ring-0"
            placeholder="Γράψε σε Markdown. Drag & drop εικόνας για αυτόματο upload."
          />
        ) : (
          <div className="prose prose-slate max-w-none px-4 py-4 text-sm">
            {busy ? <p>Φόρτωση…</p> : <div dangerouslySetInnerHTML={{ __html: previewHtml }} />}
          </div>
        )}
      </div>

      <input
        ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageAndInsert(f); }}
      />

      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className={
        active
          ? "rounded px-3 py-1 text-xs font-medium text-brand-700 bg-white shadow-sm"
          : "rounded px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
      }
    >
      {children}
    </button>
  );
}

function Btn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" title={title} onClick={onClick}
      className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-white hover:text-slate-900"
    >
      {children}
    </button>
  );
}

function Toolbar({
  insert, fileRef,
}: { insert: (b: string, a?: string) => void; fileRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div className="flex items-center gap-0.5">
      <Btn title="H1"        onClick={() => insert("# ")}>H1</Btn>
      <Btn title="H2"        onClick={() => insert("## ")}>H2</Btn>
      <Btn title="H3"        onClick={() => insert("### ")}>H3</Btn>
      <span className="mx-1 h-4 w-px bg-slate-300" />
      <Btn title="Bold"      onClick={() => insert("**", "**")}><b>B</b></Btn>
      <Btn title="Italic"    onClick={() => insert("*", "*")}><i>I</i></Btn>
      <Btn title="Λίστα"     onClick={() => insert("- ")}>•</Btn>
      <Btn title="Quote"     onClick={() => insert("> ")}>❝</Btn>
      <span className="mx-1 h-4 w-px bg-slate-300" />
      <Btn title="Σύνδεσμος" onClick={() => insert("[", "](https://)")}>🔗</Btn>
      <Btn title="Εικόνα"    onClick={() => fileRef.current?.click()}>🖼</Btn>
    </div>
  );
}
