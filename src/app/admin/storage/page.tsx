import { createClient } from "@/lib/supabase/server";
import { AdminListHeader } from "@/components/admin/AdminList";
import { PUBLIC_URL_BASE } from "@/lib/supabase/storage";

export const metadata = { title: "Αρχεία" };

const BUCKETS = ["images", "pdfs"] as const;

async function listBucket(bucket: string) {
  const supabase = await createClient();
  const items: { name: string; size: number; updated_at: string | null }[] = [];
  // recursive walk
  async function walk(prefix = "") {
    const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
    for (const f of data ?? []) {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      if (f.id) items.push({ name: path, size: f.metadata?.size ?? 0, updated_at: f.updated_at ?? null });
      else      await walk(path); // folder
    }
  }
  await walk();
  return items;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function StorageAdmin() {
  const data = await Promise.all(BUCKETS.map(async (b) => ({ bucket: b, files: await listBucket(b) })));

  const total  = data.reduce((s, d) => s + d.files.length, 0);
  const bytes  = data.reduce((s, d) => s + d.files.reduce((a, f) => a + f.size, 0), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader
        title="Αρχεία (Storage)"
        description={`${total} αρχεία, ${fmtBytes(bytes)} συνολικά. Upload γίνεται μέσα από τις φόρμες των πινάκων.`}
      />
      {data.map(({ bucket, files }) => (
        <section key={bucket} className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            {bucket} <span className="text-slate-400">({files.length})</span>
          </h2>
          {files.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Άδειο.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Όνομα</th>
                    <th className="px-4 py-2 font-semibold text-right">Μέγεθος</th>
                    <th className="px-4 py-2 font-semibold">Ενημέρωση</th>
                    <th className="w-px px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {files.map((f) => (
                    <tr key={f.name} className="hover:bg-slate-50">
                      <td className="break-all px-4 py-2 font-mono text-xs text-slate-700">{f.name}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{fmtBytes(f.size)}</td>
                      <td className="px-4 py-2 text-xs text-slate-500">{f.updated_at ? new Date(f.updated_at).toLocaleDateString("el-GR") : "—"}</td>
                      <td className="px-4 py-2">
                        <a href={`${PUBLIC_URL_BASE}/${bucket}/${f.name}`} target="_blank" rel="noopener" className="text-xs text-brand-700 hover:underline">↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
