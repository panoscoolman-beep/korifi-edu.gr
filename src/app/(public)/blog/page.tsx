import Link from "next/link";
import Image from "next/image";
import { getPublishedArticles } from "@/lib/queries";
import type { Article } from "@/types/database";

export const metadata = {
  title: "Blog",
  description: "Άρθρα, σεμινάρια και συμβουλές από το Φροντιστήριο Κορυφή.",
};

export const revalidate = 3600;

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">Blog</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Νέα & άρθρα
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Σεμινάρια, συμβουλές προετοιμασίας και νέα από την κοινότητα της Κορυφής.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-base font-medium text-slate-700">Δεν έχουν δημοσιευθεί άρθρα ακόμα.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </ul>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const date = article.published_at ? new Date(article.published_at).toLocaleDateString("el-GR", {
    day: "numeric", month: "long", year: "numeric",
  }) : null;

  return (
    <li>
      <Link
        href={`/blog/${article.slug}`}
        className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-video w-full bg-gradient-to-br from-brand-100 to-brand-50">
          {article.cover_image && (
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-5">
          {date && <p className="text-xs uppercase tracking-wider text-slate-500">{date}</p>}
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">{article.excerpt}</p>
          )}
          {article.author_name && (
            <p className="mt-3 text-xs text-slate-500">— {article.author_name}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
