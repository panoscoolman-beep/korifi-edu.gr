import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { JsonLd, articleLd, breadcrumbsLd } from "@/components/JsonLd";
import { getArticleBySlug, getAllPublishedArticleSlugs } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const date = article.published_at ? new Date(article.published_at).toLocaleDateString("el-GR", {
    day: "numeric", month: "long", year: "numeric",
  }) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={articleLd(article)} />
      <JsonLd
        data={breadcrumbsLd([
          { name: "Blog", url: "/blog" },
          { name: article.title, url: `/blog/${article.slug}` },
        ])}
      />
      <Link href="/blog" className="text-sm font-medium text-brand-700 hover:text-brand-900">
        ← Όλα τα άρθρα
      </Link>

      <header className="mt-6">
        {date && <p className="text-sm uppercase tracking-wider text-slate-500">{date}</p>}
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {article.title}
        </h1>
        {article.author_name && (
          <p className="mt-3 text-sm text-slate-600">— {article.author_name}</p>
        )}
      </header>

      {article.cover_image && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10">
        <Markdown>{article.content_md}</Markdown>
      </div>
    </article>
  );
}
