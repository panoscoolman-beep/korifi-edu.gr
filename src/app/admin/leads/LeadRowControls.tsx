"use client";

import { useState, useTransition } from "react";
import { setLeadNotes, setLeadStatus } from "./actions";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/leads";
import type { LeadStatus } from "@/types/database";

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-sky-100 text-sky-800 border-sky-200",
  booked: "bg-violet-100 text-violet-800 border-violet-200",
  enrolled: "bg-emerald-100 text-emerald-800 border-emerald-200",
  lost: "bg-slate-100 text-slate-600 border-slate-200",
};

export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState<LeadStatus>(status);

  return (
    <select
      value={current}
      disabled={pending}
      aria-label="Κατάσταση"
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        setCurrent(next);
        start(() => setLeadStatus(id, next));
      }}
      className={`rounded-full border px-2 py-1 text-xs font-medium disabled:opacity-60 ${STATUS_CLASS[current]}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}

export function LeadNotes({ id, notes }: { id: string; notes: string | null }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(notes ?? "");
  const [saved, setSaved] = useState(notes ?? "");

  return (
    <input
      type="text"
      value={value}
      disabled={pending}
      placeholder="σημείωση…"
      aria-label="Σημειώσεις"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() === saved.trim()) return;
        start(async () => {
          await setLeadNotes(id, value);
          setSaved(value);
        });
      }}
      className="w-full min-w-40 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
    />
  );
}
