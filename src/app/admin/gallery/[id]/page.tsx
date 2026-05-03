import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlbumForm } from "../AlbumForm";
import { PhotoManager } from "./PhotoManager";
import type { GalleryAlbum, GalleryPhoto } from "@/types/database";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("gallery_albums").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? `Επεξεργασία: ${data.title}` : "Άλμπουμ" };
}

export default async function EditAlbum({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: album }, { data: photos }] = await Promise.all([
    supabase.from("gallery_albums").select("*").eq("id", id).maybeSingle(),
    supabase.from("gallery_photos").select("*").eq("album_id", id).order("sort_order"),
  ]);
  if (!album) notFound();

  const a = album as GalleryAlbum;
  const ps = (photos ?? []) as GalleryPhoto[];

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <Link href="/admin/gallery" className="text-sm text-brand-700 hover:text-brand-900">← Πίσω στα άλμπουμ</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{a.title}</h1>
      </header>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Στοιχεία άλμπουμ</h2>
        <AlbumForm album={a} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Φωτογραφίες <span className="text-slate-400">({ps.length})</span>
        </h2>
        <PhotoManager albumId={a.id} photos={ps} />
      </section>
    </div>
  );
}
