import type { Metadata } from "next";
import { JsonLd, breadcrumbsLd } from "@/components/JsonLd";
import { ERGALEIA } from "@/lib/ergaleia";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

export const metadata: Metadata = {
  title: "Διαδραστικά Εργαλεία",
  description:
    "Δωρεάν διαδραστικά εκπαιδευτικά εργαλεία για μαθητές Γυμνασίου και Λυκείου: περιοδικός πίνακας, γραφική παράσταση συναρτήσεων, επιστημονική αριθμομηχανή, τριγωνομετρικός κύκλος. Από το Φροντιστήριο Κορυφή.",
  alternates: { canonical: "/ergaleia" },
  openGraph: {
    title: "Διαδραστικά Εργαλεία | Φροντιστήριο Κορυφή",
    description:
      "Δωρεάν διαδραστικά εργαλεία για Χημεία και Μαθηματικά — λειτουργούν και στο κινητό.",
    url: `${BASE_URL}/ergaleia`,
  },
};

export const revalidate = 86400;

export default function ErgaleiaPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Διαδραστικά Εργαλεία — Φροντιστήριο Κορυφή",
    itemListElement: ERGALEIA.filter((t) => t.ready).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      description: t.short,
      url: `${BASE_URL}${t.href}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={itemListLd} />
      <JsonLd data={breadcrumbsLd([{ name: "Εργαλεία", url: "/ergaleia" }])} />

      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-700">
          Δωρεάν για όλους
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Διαδραστικά Εργαλεία
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Εργαλεία μελέτης για Χημεία και Μαθηματικά — φτιαγμένα για μαθητές και
          καθηγητές. Ανοίγουν κατευθείαν στον browser, λειτουργούν άψογα στο
          κινητό και δεν χρειάζονται εγκατάσταση.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ERGALEIA.map((t) => {
          const card = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.tileFrom} ${t.tileTo} text-3xl shadow-sm`}
                  aria-hidden
                >
                  {t.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {t.subject}
                  </span>
                  {!t.ready && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      Σύντομα
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                  {t.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {t.short}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">{t.level}</span>
                {t.ready && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                    Άνοιγμα
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                )}
              </div>
            </>
          );

          const cardClass =
            "group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all";

          return (
            <li key={t.slug}>
              {t.ready ? (
                <a
                  href={t.href}
                  className={`${cardClass} hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md`}
                >
                  {card}
                </a>
              ) : (
                <div className={`${cardClass} opacity-70`}>{card}</div>
              )}
            </li>
          );
        })}
      </ul>

      <aside className="mt-12 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-amber-50/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">
          💡 Συμβουλή για κινητό
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Άνοιξε ένα εργαλείο στο κινητό και διάλεξε{" "}
          <span className="font-medium">«Προσθήκη στην αρχική οθόνη»</span> από το
          μενού του browser. Θα το έχεις σαν εφαρμογή, με πρόσβαση ακόμα και χωρίς
          σύνδεση στο διαδίκτυο.
        </p>
      </aside>
    </div>
  );
}
