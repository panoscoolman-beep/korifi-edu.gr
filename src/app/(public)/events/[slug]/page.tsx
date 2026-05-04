import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { JsonLd, eventLd, breadcrumbsLd } from "@/components/JsonLd";
import { getEventBySlug, getPublishedEvents } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await getPublishedEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return {};
  return { title: e.title, description: e.description_md.slice(0, 150) };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) notFound();

  const date = e.starts_at ? new Date(e.starts_at).toLocaleString("el-GR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={eventLd(e)} />
      <JsonLd
        data={breadcrumbsLd([
          { name: "Εκδηλώσεις", url: "/events" },
          { name: e.title, url: `/events/${e.slug}` },
        ])}
      />
      <Link href="/events" className="text-sm font-medium text-brand-700 hover:text-brand-900">← Όλες οι εκδηλώσεις</Link>

      <header className="mt-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{e.title}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
          {date && <span>📅 {date}</span>}
          {e.location && <span>📍 {e.location}</span>}
          {e.is_online && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Online</span>}
        </div>
      </header>

      {e.cover_image && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={e.cover_image} alt={e.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
        </div>
      )}

      <div className="mt-10">
        <Markdown>{e.description_md}</Markdown>
      </div>

      {e.link_url && (
        <a href={e.link_url} target="_blank" rel="noopener" className="mt-10 inline-block rounded-full bg-brand-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-700">
          {e.is_online ? "Σύνδεσμος συμμετοχής →" : "Περισσότερες πληροφορίες →"}
        </a>
      )}
    </article>
  );
}
