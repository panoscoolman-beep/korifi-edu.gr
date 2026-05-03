"use client";

import { useState, useTransition } from "react";
import { setUserRole } from "@/app/admin/actions";

const ROLES = [
  { value: "student", label: "Μαθητής" },
  { value: "teacher", label: "Καθηγητής" },
  { value: "admin",   label: "Διαχειριστής" },
] as const;

export function UserRoleSelect({ userId, role }: { userId: string; role: "student"|"teacher"|"admin" }) {
  const [val,  setVal]  = useState(role);
  const [busy, startTransition] = useTransition();

  function onChange(newRole: typeof val) {
    if (newRole === val) return;
    if (!confirm(`Αλλαγή role σε "${newRole}";`)) return;
    setVal(newRole);
    startTransition(async () => {
      try { await setUserRole(userId, newRole); }
      catch (e) { alert(`Σφάλμα: ${e instanceof Error ? e.message : e}`); setVal(role); }
    });
  }

  return (
    <select
      value={val}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as typeof val)}
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
    >
      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
    </select>
  );
}
