import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable } from "@/components/admin/AdminList";
import { SITE_EVENT_LABEL, SITE_EVENT_NAMES } from "@/lib/leads";
import type { Lead, SiteEvent, SiteEventName } from "@/types/database";
import { LeadNotes, LeadStatusSelect } from "./LeadRowControls";

export const metadata = { title: "Leads & μετρήσεις" };
export const dynamic = "force-dynamic";

const DAYS = 30;

/** ISO timestamp «πριν από N μέρες» — εκτός component, για να μείνει το render καθαρό. */
function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("el-GR", {
    timeZone: "Europe/Athens", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default async function LeadsAdmin() {
  const supabase = await createClient();
  const since = daysAgoIso(DAYS);

  const [{ data: leadRows }, { data: eventRows }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("site_events").select("name, path").gte("created_at", since).limit(10000),
  ]);
  const leads = (leadRows ?? []) as Lead[];
  const events = (eventRows ?? []) as Pick<SiteEvent, "name" | "path">[];

  const byName = Object.fromEntries(SITE_EVENT_NAMES.map((n) => [n, 0])) as Record<SiteEventName, number>;
  const byPath = new Map<string, number>();
  for (const e of events) {
    byName[e.name] = (byName[e.name] ?? 0) + 1;
    const p = e.path ?? "(άγνωστη)";
    byPath.set(p, (byPath.get(p) ?? 0) + 1);
  }
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminListHeader
        title="Leads & μετρήσεις"
        description={`${leads.length} leads (${newCount} νέα). Μετρήσεις τελευταίων ${DAYS} ημερών, χωρίς cookies.`}
      />

      <section aria-label="Μετρήσεις" className="mb-8 grid gap-3 sm:grid-cols-4">
        {SITE_EVENT_NAMES.map((n) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">{SITE_EVENT_LABEL[n]}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{byName[n]}</p>
          </div>
        ))}
      </section>

      {topPaths.length > 0 && (
        <section aria-label="Σελίδες" className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Από ποιες σελίδες ({DAYS} ημέρες)</p>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {topPaths.map(([p, n]) => (
              <li key={p} className="flex items-center justify-between py-1.5">
                <span className="truncate font-mono text-xs text-slate-700">{p}</span>
                <span className="ml-4 shrink-0 font-semibold text-slate-900">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdminTable
        rows={leads}
        emptyMessage="Κανένα lead ακόμα. Η φόρμα υπάρχει στα μαθήματα, στα άρθρα και στις σελίδες τάξεων."
        columns={[
          { header: "Πότε", cell: (r) => <span className="whitespace-nowrap text-xs text-slate-500">{fmtDate(r.created_at)}</span> },
          { header: "Όνομα", cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          {
            header: "Τηλέφωνο",
            cell: (r) => (
              <a href={`tel:${r.phone}`} data-tracked className="whitespace-nowrap text-brand-700 hover:text-brand-900">
                {r.phone.replace(/^\+30/, "")}
              </a>
            ),
          },
          { header: "Τάξη", cell: (r) => r.grade ?? "—" },
          { header: "Ενδιαφέρον", cell: (r) => r.interest ?? "—" },
          {
            header: "Από",
            cell: (r) =>
              r.source_path ? (
                <a href={r.source_path} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 underline-offset-2 hover:underline">
                  {r.source_label ?? r.source_path}
                </a>
              ) : "—",
          },
          { header: "Κατάσταση", cell: (r) => <LeadStatusSelect id={r.id} status={r.status} /> },
          { header: "Σημειώσεις", cell: (r) => <LeadNotes id={r.id} notes={r.notes} />, className: "min-w-48" },
        ]}
      />
    </div>
  );
}
