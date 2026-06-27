/**
 * Inject a JSON-LD structured data block into the page head.
 *
 * Use as a server component:
 *   <JsonLd data={{ "@context": "https://schema.org", "@type": "LocalBusiness", ... }} />
 *
 * Multiple <JsonLd> blocks per page are fine — search engines pick up all of them.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

/* -------------------------------------------------------------------------- */
/*  Schema builders                                                           */
/* -------------------------------------------------------------------------- */

/**
 * BreadcrumbList helper — call with an array of {name, url}, root last omitted.
 * Example: breadcrumbsLd([{name: "Blog", url: "/blog"}, {name: "Article", url: "/blog/foo"}])
 */
export function breadcrumbsLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Αρχική", item: BASE_URL + "/" },
      ...items.map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: i.name,
        item: i.url.startsWith("http") ? i.url : `${BASE_URL}${i.url}`,
      })),
    ],
  };
}

/** Article schema for blog posts. */
export function articleLd(a: {
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    image: a.cover_image ?? `${BASE_URL}/logo-tagline.png`,
    datePublished: a.published_at ?? undefined,
    dateModified: a.published_at ?? undefined,
    author: a.author_name
      ? { "@type": "Person", name: a.author_name }
      : { "@type": "Organization", name: "Φροντιστήριο Κορυφή" },
    publisher: {
      "@type": "EducationalOrganization",
      name: "Φροντιστήριο Κορυφή",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${a.slug}`,
    },
    inLanguage: "el-GR",
  };
}

/** Course schema for /courses/[slug]. */
export function courseLd(c: {
  title: string;
  description?: string | null;
  slug: string;
  subjectName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.description ?? `Μάθημα ${c.title} στο Φροντιστήριο Κορυφή.`,
    provider: {
      "@type": "EducationalOrganization",
      name: "Φροντιστήριο Κορυφή",
      url: BASE_URL,
      sameAs: BASE_URL,
    },
    url: `${BASE_URL}/courses/${c.slug}`,
    inLanguage: "el-GR",
    educationalLevel: c.subjectName ?? undefined,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Blended",
      location: { "@type": "Place", name: "Καλλονή Λέσβου" },
      inLanguage: "el-GR",
    },
  };
}

/** Event schema for /events/[slug]. */
export function eventLd(e: {
  title: string;
  description_md?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  location?: string | null;
  is_online?: boolean;
  cover_image?: string | null;
  link_url?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: (e.description_md ?? "").slice(0, 300),
    startDate: e.starts_at ?? undefined,
    endDate: e.ends_at ?? undefined,
    eventAttendanceMode: e.is_online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: e.is_online
      ? {
          "@type": "VirtualLocation",
          url: e.link_url ?? `${BASE_URL}/events/${e.slug}`,
        }
      : {
          "@type": "Place",
          name: e.location ?? "Καλλονή Λέσβου",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Καλλονή",
            addressRegion: "Λέσβος",
            addressCountry: "GR",
          },
        },
    image: e.cover_image ?? undefined,
    organizer: {
      "@type": "EducationalOrganization",
      name: "Φροντιστήριο Κορυφή",
      url: BASE_URL,
    },
    url: `${BASE_URL}/events/${e.slug}`,
    inLanguage: "el-GR",
  };
}

/** WebSite node for the homepage (ties pages to the org via @id refs). */
export const KORIFI_WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "Φροντιστήριο Κορυφή",
  url: BASE_URL,
  inLanguage: "el-GR",
  publisher: { "@id": `${BASE_URL}/#organization` },
} as const;

/** Generic WebPage node — for CMS pages & gallery albums that have no richer type. */
export function webPageLd(p: { name: string; url: string; description?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.name,
    url: p.url.startsWith("http") ? p.url : `${BASE_URL}${p.url}`,
    description: p.description ?? undefined,
    inLanguage: "el-GR",
    isPartOf: { "@id": `${BASE_URL}/#website` },
  };
}

export const KORIFI_LOCAL_BUSINESS_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${BASE_URL}/#organization`,
  name: "Φροντιστήριο Κορυφή",
  alternateName: "Korifi",
  description: "Φροντιστήριο Μέσης Εκπαίδευσης στην Καλλονή Λέσβου από το 2019 — Γυμνάσιο, Λύκειο, ΕΠΑΛ, Πανελλήνιες.",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  telephone: "+30 22530 25080",
  email: "frontistiriokorifh@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Καλλονή Λέσβου",
    addressLocality: "Καλλονή",
    addressRegion: "Λέσβος",
    postalCode: "81107",
    addressCountry: "GR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 39.2317168,
    longitude: 26.2119776,
  },
  sameAs: [
    "https://www.instagram.com/frontistiriakorifh/",
    "https://www.facebook.com/frontistiriokorifh",
  ],
  hasMap: "https://maps.app.goo.gl/G3P3Bc8ync7s9arc8",
  foundingDate: "2019",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Λέσβος",
  },
} as const;
