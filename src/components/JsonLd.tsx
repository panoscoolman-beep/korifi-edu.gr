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
      // eslint-disable-next-line react/no-danger -- safe: data is structured object, JSON.stringify escapes
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

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
    latitude: 39.2305,
    longitude: 26.1989,
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
