import Link from "next/link";
import Image from "next/image";
import { getPublishedEvents } from "@/lib/queries";
import type { Event as EventType } from "@/types/database";

export const metadata = {
  title: "Εκδηλώσεις",
  description: "Σεμινάρια, διαδικτυακές εκδηλώσεις και συναντήσεις του Φροντιστηρίου Κορυφή.",
  alternates: { canonical: "/events" },
};

export const revalidate = 600;

export default async function EventsPage() {
  const all      = await getPublishedEvents();
  const now      = new Date().toISOString();
  const upcoming = all.filter((e) => !e.starts_at || e.starts_at >= now);
  const past     = all.filter((e) => e.starts_at && e.starts_at <  now).reverse();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">Εκδηλώσεις</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Σεμινάρια & συναντήσεις
        </h1>
      </header>

      <Section title="Επερχόμενες" items={upcoming} emptyText="Δεν υπάρχουν προγραμματισμένες εκδηλώσεις." />
      {past.length > 0 && (
        <div className="mt-12">
          <Section title="Παρελθούσες" items={past} muted />
        </div>
      )}
    </div>
  );
}

function Section({ title, items, emptyText, muted }: { title: string; items: EventType[]; emptyText?: string; muted?: boolean }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">{emptyText}</p>
        </div>
      ) : (
        <ul className={"mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 " + (muted ? "opacity-80" : "")}>
          {items.map((e) => <EventCard key={e.id} event={e} />)}
        </ul>
      )}
    </section>
  );
}

function EventCard({ event }: { event: EventType }) {
  const date = event.starts_at ? new Date(event.starts_at).toLocaleString("el-GR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : null;

  return (
    <li>
      <Link href={`/events/${event.slug}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full bg-gradient-to-br from-brand-100 to-brand-50">
          {event.cover_image && (
            <Image src={event.cover_image} alt={event.title} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            {event.is_online && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Online</span>}
          </div>
        </div>
        <div className="p-5">
          {date && <p className="text-xs uppercase tracking-wider text-slate-500">{date}</p>}
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{event.title}</h3>
          {event.location && <p className="mt-2 text-sm text-slate-600">📍 {event.location}</p>}
        </div>
      </Link>
    </li>
  );
}
