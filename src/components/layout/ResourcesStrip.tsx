import Image from "next/image";

// External links to Stadiodromia.gr platform (same partnership account as the legacy korifi-edu.gr).
// `cid` is the Κορυφή customer id at Stadiodromia.
const STADIODROMIA_CID = "FD7C31D3-576C-4DD7-8896-6FC03492112D";

// Εικονίδια self-hosted στο /public/resources/ — δεν εξαρτώνται πια από το νεκρό
// WordPress CDN (i0.wp.com). Βλ. CHANGELOG για το γιατί άλλαξαν.
const RESOURCES = [
  {
    href: `https://odigos.stadiodromia.gr/login.php?cid=${STADIODROMIA_CID}`,
    title: "Οδηγός Σταδιοδρομίας",
    description: "Επιλογή σχολών, επαγγέλματα, πεδία.",
    image: "/resources/odigos-stadiodromias.png",        // πυξίδα + "ΟΣ"
    external: true,
  },
  {
    href: `https://public.stadiodromia.gr/8emata/index.php?cid=${STADIODROMIA_CID}`,
    title: "Θέματα Πανελλαδικών",
    description: "Αρχείο θεμάτων ανά έτος και μάθημα.",
    image: "/resources/themata-panelladikon.svg",        // exam papers
    external: true,
  },
  {
    href: `https://public.stadiodromia.gr/moria/index.php?cid=${STADIODROMIA_CID}`,
    title: "Υπολογισμός Μορίων",
    description: "Υπολόγισε τα μόριά σου για κάθε σχολή.",
    image: "/resources/ypologismos-morion.svg",          // calculator
    external: true,
  },
  {
    href: `https://public.stadiodromia.gr/load.php?cid=${STADIODROMIA_CID}`,
    title: "Τα τελευταία νέα των Πανελληνίων",
    description: "Ενημερώσεις, αλλαγές, ανακοινώσεις.",
    image: "/resources/teleftaia-nea.svg",               // newspaper "ΝΕΑ"
    external: true,
  },
];

export function ResourcesStrip() {
  return (
    <section className="bg-gradient-to-br from-brand-50 to-amber-50/50 border-y border-brand-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Χρήσιμα εργαλεία
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Όλα τα απαραίτητα για τις Πανελλήνιες σε ένα μέρος.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCES.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                target={r.external ? "_blank" : undefined}
                rel={r.external ? "noopener noreferrer" : undefined}
                className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
              >
                <div className="relative aspect-[428/295] w-full overflow-hidden bg-gradient-to-br from-brand-50 to-amber-50">
                  <Image
                    src={r.image}
                    alt={r.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4 transition-transform group-hover:scale-105"
                  />
                  {r.external && (
                    <svg className="absolute right-3 top-3 h-4 w-4 text-slate-400 group-hover:text-brand-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 2h5v5M14 2L7 9M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"/>
                    </svg>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
