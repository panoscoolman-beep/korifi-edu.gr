import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { GalleryAlbum } from "@/types/database";

export const metadata = {
  title: "Φωτογραφίες",
  description: "Δράσεις, εκδηλώσεις και στιγμές από το φροντιστήριο Κορυφή.",
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: false, nullsFirst: false });

  const list = (albums ?? []) as GalleryAlbum[];

  // photo counts
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">Στιγμές</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Φωτογραφίες
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Δράσεις, εκδηλώσεις και στιγμές από τη ζωή του φροντιστηρίου.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-base font-medium text-slate-700">Δεν υπάρχουν άλμπουμ ακόμα.</p>
          <p className="mt-2 text-sm text-slate-500">Σύντομα θα ανεβούν φωτογραφίες από εκδηλώσεις και δράσεις μας.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <li key={a.id}>
              <Link
                href={`/gallery/${a.slug}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video w-full bg-gradient-to-br from-brand-100 to-brand-50">
                  {a.cover_image && (
                    <Image
                      src={a.cover_image}
                      alt={a.title}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  {counts[a.id] != null && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                      📷 {counts[a.id]}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {a.event_date && (
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      {new Date(a.event_date).toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                    {a.title}
                  </h2>
                  {a.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{a.description}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
