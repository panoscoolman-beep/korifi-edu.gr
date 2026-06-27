import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbox } from "./Lightbox";
import { JsonLd, webPageLd, breadcrumbsLd } from "@/components/JsonLd";
import { getAlbumBySlug, getPhotosByAlbum, getPublishedAlbums } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const albums = await getPublishedAlbums();
  return albums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const a = await getAlbumBySlug(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description ?? undefined,
    alternates: { canonical: `/gallery/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description ?? undefined,
      url: `/gallery/${a.slug}`,
      images: [a.cover_image ?? "/og-default.png"],
    },
  };
}

export default async function AlbumPage({ params }: { params: Params }) {
  const { slug } = await params;
  const a = await getAlbumBySlug(slug);
  if (!a) notFound();

  const ps = await getPhotosByAlbum(a.id);

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={webPageLd({ name: a.title, url: `/gallery/${a.slug}`, description: a.description })} />
      <JsonLd
        data={breadcrumbsLd([
          { name: "Φωτογραφίες", url: "/gallery" },
          { name: a.title, url: `/gallery/${a.slug}` },
        ])}
      />
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
