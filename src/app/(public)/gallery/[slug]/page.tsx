import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Lightbox } from "./Lightbox";
import type { GalleryAlbum, GalleryPhoto } from "@/types/database";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_albums")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!data) return {};
  return { title: data.title, description: data.description ?? undefined };
}

export default async function AlbumPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!album) notFound();

  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order");

  const a  = album as GalleryAlbum;
  const ps = (photos ?? []) as GalleryPhoto[];

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/gallery" className="text-sm font-medium text-brand-700 hover:text-brand-900">
        ← Όλα τα άλμπουμ
      </Link>

      <header className="mt-6">
        {a.event_date && (
          <p className="text-sm uppercase tracking-wider text-slate-500">
            {new Date(a.event_date).toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{a.title}</h1>
        {a.description && (
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{a.description}</p>
        )}
      </header>

      {ps.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm text-slate-600">Δεν υπάρχουν φωτογραφίες σε αυτό το άλμπουμ.</p>
        </div>
      ) : (
        <Lightbox photos={ps} />
      )}
    </article>
  );
}
