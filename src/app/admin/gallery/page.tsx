import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminListHeader, AdminTable, PublishedBadge } from "@/components/admin/AdminList";
import type { GalleryAlbum } from "@/types/database";

export const metadata = { title: "Gallery άλμπουμ" };

export default async function GalleryAdmin() {
  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("sort_order", { ascending: true });

  const list = (albums ?? []) as GalleryAlbum[];

  // photo counts per album
  const counts: Record<string, number> = {};
  if (list.length) {
    const ids = list.map((a) => a.id);
    const { data: photos } = await supabase
      .from("gallery_photos")
      .select("album_id")
      .in("album_id", ids);
    for (const p of photos ?? []) counts[p.album_id] = (counts[p.album_id] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminListHeader
        title="Άλμπουμ φωτογραφιών"
        description="Δράσεις, εκδηλώσεις, ζωή στο φροντιστήριο."
        newHref="/admin/gallery/new"
      />
      <AdminTable
        rows={list}
        rowHref={(r) => `/admin/gallery/${r.id}`}
        emptyMessage="Δεν υπάρχουν άλμπουμ ακόμα."
        columns={[
          { header: "Τίτλος", className: "w-2/5", cell: (r) => (
            <div className="flex items-center gap-3">
              <Cover src={r.cover_image} />
              <div>
                <div className="font-medium text-slate-900">{r.title}</div>
                <div className="text-xs text-slate-500">{r.slug}</div>
              </div>
            </div>
          )},
          { header: "Φωτογραφίες", cell: (r) => counts[r.id] ?? 0, className: "text-right" },
          { header: "Ημερομηνία",  cell: (r) => r.event_date ? new Date(r.event_date).toLocaleDateString("el-GR") : "—" },
          { header: "Σειρά",       cell: (r) => r.sort_order, className: "text-right" },
          { header: "Κατάσταση",   cell: (r) => <PublishedBadge published={r.is_published} /> },
        ]}
      />
    </div>
  );
}

function Cover({ src }: { src: string | null }) {
  if (!src) return <div className="flex h-12 w-16 items-center justify-center rounded bg-slate-100 text-slate-400">📷</div>;
  return <img src={src} alt="" className="h-12 w-16 rounded object-cover" />;
}
