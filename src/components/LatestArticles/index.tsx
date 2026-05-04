import { Article } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

export default function LatestArticles({ items }: { items: Article[] }) {
    if (items.length === 0) return null;
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Από το blog</h2>
          <Link href="/blog" className="text-sm font-medium text-brand-700 hover:text-brand-900">Όλα τα άρθρα →</Link>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {items.map((a) => {
            const date = a.published_at ? new Date(a.published_at).toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" }) : null;
            return (
              <li key={a.id}>
                <Link href={`/blog/${a.slug}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
                  <div className="relative aspect-video bg-gradient-to-br from-brand-100 to-brand-50">
                    {a.cover_image && <Image src={a.cover_image} alt={a.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />}
                  </div>
                  <div className="p-5">
                    {date && <p className="text-xs uppercase tracking-wider text-slate-500">{date}</p>}
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-700">{a.title}</h3>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
  