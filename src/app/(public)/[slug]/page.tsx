import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { LeadForm } from "@/components/LeadForm";
import { guessGrade } from "@/lib/leads";
import { JsonLd, webPageLd, breadcrumbsLd } from "@/components/JsonLd";
import { getPageBySlug, getAllPublishedPageSlugs } from "@/lib/queries";

type Params = Promise<{ slug: string }>;

// Reserve slugs that have their own dedicated route file.
const RESERVED = new Set([
  "gia-emas", "courses", "lessons",
  "blog", "events", "synergates", "gallery", "martyries",
  "login", "register", "dashboard", "admin",
]);

// Σελίδες τάξεων/υπηρεσιών που παίρνουν αυτόματα τη φόρμα «Κλείσε δωρεάν
// διαγνωστικό» στο τέλος. Οποιαδήποτε άλλη σελίδα μπορεί να τη βάλει όπου θέλει
// γράφοντας τη λέξη `{{lead-form}}` μόνη της σε μια γραμμή του κειμένου (admin).
const LEAD_FORM_SLUGS = new Set([
  "gimnasio", "alikeiou", "blikeiou", "glikeiou", "epal", "online-mathimata", "epikoinonia",
]);
const LEAD_FORM_MARKER = "{{lead-form}}";

// ISR + prerender all known slugs at build time.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedPageSlugs();
  return slugs.filter((s) => !RESERVED.has(s)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};

  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "article",
      title: page.title,
      description: page.meta_description ?? undefined,
      url: `/${slug}`,
      images: ["/og-default.png"],
    },
  };
}

export default async function DynamicPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const p = await getPageBySlug(slug);
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={webPageLd({ name: p.title, url: `/${slug}`, description: p.meta_description })} />
      <JsonLd data={breadcrumbsLd([{ name: p.title, url: `/${slug}` }])} />
      <header className="mb-12 border-b-2 border-amber-300 pb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          Φροντιστήριο Κορυφή
        </p>
        <h1 className="mt-3 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          {p.title}
        </h1>
        {p.meta_description && (
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{p.meta_description}</p>
        )}
      </header>

      {renderContent(slug, p.title, p.content_md)}
    </article>
  );
}

function renderContent(slug: string, title: string, md: string) {
  const form = (
    <LeadForm source={`/${slug}`} sourceLabel={title} grade={guessGrade(slug)} />
  );
  const at = md.indexOf(LEAD_FORM_MARKER);
  if (at >= 0) {
    const before = md.slice(0, at);
    const after = md.slice(at + LEAD_FORM_MARKER.length);
    return (
      <>
        <Markdown>{before}</Markdown>
        {form}
        {after.trim() && <Markdown>{after}</Markdown>}
      </>
    );
  }
  return (
    <>
      <Markdown>{md}</Markdown>
      {LEAD_FORM_SLUGS.has(slug) && form}
    </>
  );
}
