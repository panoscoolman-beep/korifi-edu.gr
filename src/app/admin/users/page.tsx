import { createClient } from "@/lib/supabase/server";
import { AdminListHeader } from "@/components/admin/AdminList";
import { UserRoleSelect } from "./UserRoleSelect";

export const metadata = { title: "Χρήστες" };

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: "student" | "teacher" | "admin";
  created_at: string;
};

export default async function UsersAdmin() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const rows = (profiles ?? []) as ProfileRow[];

  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader title="Χρήστες" description={`${rows.length} εγγεγραμμένοι.`} />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Όνομα</th>
              <th className="px-4 py-3 font-semibold">Εγγραφή</th>
              <th className="w-44 px-4 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{u.full_name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{u.id.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {new Date(u.created_at).toLocaleDateString("el-GR")}
                </td>
                <td className="px-4 py-3">
                  <UserRoleSelect userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Δεν έχει εγγραφεί κανείς ακόμα.</p>
      )}
    </div>
  );
}
