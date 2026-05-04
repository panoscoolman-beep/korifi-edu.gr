import Link from "next/link";

/**
 * Seasonal hero block — shown at the top of the homepage.
 * Auto-detects current "period" from the calendar so the look-and-feel rotates
 * through the school year without admin work. Override via the `season` prop.
 *
 * Add a new theme: extend `SEASONS` and `pickSeason()`. Custom imagery can be
 * dropped under /public/seasonal/<key>.* and referenced in `bgImage`.
 */

type SeasonKey = "spring-panellinies" | "summer" | "autumn-start" | "winter-exams";

type SeasonTheme = {
  key: SeasonKey;
  kicker: string;
  headline: string;
  highlight: string; // colored word inside headline
  sub: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  // Tailwind classes for the wrapper background. Keep gradients here so we don't
  // need a runtime style attribute.
  bgClass: string;
  // Decorative emoji watermark (optional). Keeps it lightweight + brand-safe.
  decoration?: string;
};

const SEASONS: Record<SeasonKey, SeasonTheme> = {
  "spring-panellinies": {
    key: "spring-panellinies",
    kicker: "Πανελλήνιες — τελική ευθεία",
    headline: "Στοχεύουμε στην ",
    highlight: "κορυφή",
    sub: "Επαναληπτικά τμήματα, διαγωνίσματα και προσομοιώσεις για να φτάσεις προετοιμασμένος.",
    primaryCta: { href: "/glikeiou", label: "Πρόγραμμα Γ' Λυκείου" },
    secondaryCta: { href: "/epaggelmatikos-prosanatolismos", label: "Επαγγελματικός Προσανατολισμός" },
    bgClass: "bg-gradient-to-br from-rose-50 via-amber-50 to-brand-50",
    decoration: "📚",
  },
  "summer": {
    key: "summer",
    kicker: "Καλοκαίρι 2026",
    headline: "Ξεκίνα την επόμενη χρονιά ",
    highlight: "από νωρίς",
    sub: "Καλοκαιρινά τμήματα προετοιμασίας — γερές βάσεις πριν το Σεπτέμβριο. Ευέλικτο πρόγραμμα, μικρά τμήματα.",
    primaryCta: { href: "/courses", label: "Καλοκαιρινά μαθήματα" },
    secondaryCta: { href: "/epikoinonia", label: "Επικοινωνία" },
    bgClass: "bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-50",
    decoration: "☀️",
  },
  "autumn-start": {
    key: "autumn-start",
    kicker: "Νέα σχολική χρονιά",
    headline: "Καλωσήρθες στην ",
    highlight: "Κορυφή",
    sub: "Έναρξη μαθημάτων Σεπτέμβριο. Εγγραφές ανοιχτές για όλες τις τάξεις — Γυμνάσιο, Λύκειο, ΕΠΑΛ.",
    primaryCta: { href: "/courses", label: "Δες όλα τα τμήματα" },
    secondaryCta: { href: "/epikoinonia", label: "Κλείσε ραντεβού" },
    bgClass: "bg-gradient-to-br from-amber-100 via-orange-50 to-brand-50",
    decoration: "🍂",
  },
  "winter-exams": {
    key: "winter-exams",
    kicker: "Χειμώνας — εντατική προετοιμασία",
    headline: "Κάθε ώρα μελέτης ",
    highlight: "μετράει",
    sub: "Στοχευμένη υποστήριξη για διαγωνίσματα και τετραμηνιαία. Σύγχρονη και εξ αποστάσεως διδασκαλία.",
    primaryCta: { href: "/courses", label: "Δες τα μαθήματα" },
    secondaryCta: { href: "/online-mathimata", label: "Online μαθήματα" },
    bgClass: "bg-gradient-to-br from-brand-50 via-slate-50 to-blue-50",
    decoration: "❄️",
  },
};

export function pickSeason(date = new Date()): SeasonKey {
  const m = date.getMonth(); // 0..11
  // Nov–Feb: winter / exam prep
  if (m === 10 || m === 11 || m === 0 || m === 1) return "winter-exams";
  // Mar–May: Panellinies push
  if (m >= 2 && m <= 4) return "spring-panellinies";
  // Jun–Aug: summer
  if (m >= 5 && m <= 7) return "summer";
  // Sep–Oct: school year start
  return "autumn-start";
}

export function SeasonalHero({ season }: { season?: SeasonKey } = {}) {
  const theme = SEASONS[season ?? pickSeason()];
  return (
    <section className={`relative overflow-hidden ${theme.bgClass}`}>
      {theme.decoration && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 select-none text-[12rem] opacity-10 sm:text-[16rem]"
        >
          {theme.decoration}
        </span>
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 backdrop-blur-sm sm:text-sm">
          {theme.decoration && <span aria-hidden>{theme.decoration}</span>}
          {theme.kicker}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          {theme.headline}
          <span className="bg-gradient-to-r from-brand-700 to-amber-600 bg-clip-text text-transparent">
            {theme.highlight}
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-700 sm:text-lg">
          {theme.sub}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={theme.primaryCta.href}
            className="rounded-full bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg"
          >
            {theme.primaryCta.label}
          </Link>
          {theme.secondaryCta && (
            <Link
              href={theme.secondaryCta.href}
              className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-800 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:bg-white hover:text-brand-700"
            >
              {theme.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
