import Link from "next/link";

export type ListColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function AdminListHeader({
  title, description, newHref,
}: { title: string; description?: string; newHref?: string }) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {newHref && (
        <Link
          href={newHref}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          + Νέο
        </Link>
      )}
    </header>
  );
}

export function AdminTable<T extends { id: string }>({
  rows, columns, emptyMessage = "Δεν υπάρχουν εγγραφές.",
  rowHref,
}: {
  rows: T[];
  columns: ListColumn<T>[];
  emptyMessage?: string;
  rowHref?: (row: T) => string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <p className="text-sm text-slate-600">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={"px-4 py-3 font-semibold " + (c.className ?? "")}>{c.header}</th>
            ))}
            {rowHref && <th className="w-px px-2 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((c, i) => (
                <td key={i} className={"px-4 py-3 align-middle text-slate-700 " + (c.className ?? "")}>
                  {c.cell(row)}
                </td>
              ))}
              {rowHref && (
                <td className="px-2">
                  <Link href={rowHref(row)} className="text-xs font-medium text-brand-700 hover:text-brand-900">
                    Επεξεργασία →
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Δημοσιευμένο</span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Πρόχειρο</span>
  );
}
