import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

/**
 * Seasonal hero carousel — shown at the top of the homepage.
 * Auto-detects current "period" from the calendar so the look-and-feel rotates
 * through the school year without admin work. Override via the `season` prop.
 *
 * Image storage: hero photos live in Supabase Storage under `images/hero/`.
 * Add a new slide: drop a photo there, append to the relevant `SEASONS[key]`.
 */

type SeasonKey = "spring-panellinies" | "summer" | "autumn-start" | "winter-exams";

const STORAGE = "https://zasshnqnexnuzmplolnu.supabase.co/storage/v1/object/public/images/hero";

const KALLONI = `${STORAGE}/kalloni.png`;
const HYBRID  = `${STORAGE}/hybrid.png`;
const SUMMER  = `${STORAGE}/summer.jpg`;

// Tinted overlays — make text legible on top of any photo while still keeping
// each season feeling distinct.
const OVERLAYS = {
  panellinies: "bg-gradient-to-br from-rose-900/85 via-brand-900/70 to-amber-900/55",
  summer:      "bg-gradient-to-br from-sky-900/75 via-emerald-900/55 to-amber-700/45",
  autumn:      "bg-gradient-to-br from-orange-900/80 via-amber-900/65 to-brand-900/55",
  winter:      "bg-gradient-to-br from-slate-900/85 via-brand-900/70 to-blue-900/60",
} as const;

const SEASONS: Record<SeasonKey, HeroSlide[]> = {
  "spring-panellinies": [
    {
      image: KALLONI,
      alt: "Καλλονή Λέσβου — η έδρα του φροντιστηρίου Κορυφή",
      kicker: "Πανελλήνιες — τελική ευθεία",
      headline: "Στοχεύουμε στην",
      highlight: "κορυφή",
      sub: "Επαναληπτικά τμήματα, διαγωνίσματα και προσομοιώσεις. Φτάσε προετοιμασμένος στις εξετάσεις.",
      cta: { href: "/glikeiou", label: "Πρόγραμμα Γ' Λυκείου" },
      secondaryCta: { href: "/epaggelmatikos-prosanatolismos", label: "Επαγγελματικός Προσανατολισμός" },
      overlayClass: OVERLAYS.panellinies,
    },
    {
      image: HYBRID,
      alt: "Υβριδική διδασκαλία στην τάξη του Κορυφή",
      kicker: "Υβριδική διδασκαλία",
      headline: "Σύγχρονα μέσα,",
      highlight: "ίδια ποιότητα",
      sub: "Παρακολούθησε από την αίθουσα ή online — στο ίδιο μάθημα, ταυτόχρονα.",
      cta: { href: "/online-mathimata", label: "Πώς λειτουργεί" },
      secondaryCta: { href: "/courses", label: "Δες τα μαθήματα" },
      overlayClass: OVERLAYS.panellinies,
    },
    {
      image: KALLONI,
      alt: "Φροντιστήριο Κορυφή — Καλλονή Λέσβου",
      kicker: "Από το 2019 στην Καλλονή Λέσβου",
      headline: "Μικρά τμήματα,",
      highlight: "προσωπική παρακολούθηση",
      sub: "Έως 5 μαθητές ανά τμήμα. Κάθε παιδί παίρνει την προσοχή που του αξίζει.",
      cta: { href: "/gia-emas", label: "Γνώρισέ μας" },
      secondaryCta: { href: "/epikoinonia", label: "Επικοινωνία" },
      overlayClass: OVERLAYS.panellinies,
    },
  ],
  "summer": [
    {
      image: SUMMER,
      alt: "Καλοκαιρινά μαθήματα στο Κορυφή",
      kicker: "Καλοκαίρι 2026",
      headline: "Ξεκίνα την επόμενη χρονιά",
      highlight: "από νωρίς",
      sub: "Καλοκαιρινά τμήματα προετοιμασίας — γερές βάσεις πριν το Σεπτέμβριο. Ευέλικτο πρόγραμμα, μικρά τμήματα.",
      cta: { href: "/courses", label: "Καλοκαιρινά μαθήματα" },
      secondaryCta: { href: "/epikoinonia", label: "Κλείσε θέση" },
      overlayClass: OVERLAYS.summer,
    },
    {
      image: KALLONI,
      alt: "Καλλονή Λέσβου το καλοκαίρι",
      kicker: "Καλοκαιρινή Καλλονή",
      headline: "Διακοπές + γερές βάσεις,",
      highlight: "χωρίς άγχος",
      sub: "Σύγχρονη ή εξ αποστάσεως διδασκαλία ώστε να μην χάσεις τις διακοπές σου ούτε την ύλη.",
      cta: { href: "/online-mathimata", label: "Online μαθήματα" },
      secondaryCta: { href: "/courses", label: "Όλα τα τμήματα" },
      overlayClass: OVERLAYS.summer,
    },
    {
      image: HYBRID,
      alt: "Υβριδική θερινή διδασκαλία",
      kicker: "Επόμενη χρονιά",
      headline: "Κερδίστε τον",
      highlight: "Σεπτέμβριο",
      sub: "Όσοι ξεκινούν Ιούνιο–Ιούλιο πιάνουν φόρα. Έτοιμοι για τη νέα ύλη όταν χτυπήσει το πρώτο κουδούνι.",
      cta: { href: "/courses", label: "Πρόγραμμα" },
      overlayClass: OVERLAYS.summer,
    },
  ],
  "autumn-start": [
    {
      image: KALLONI,
      alt: "Νέα σχολική χρονιά στο Κορυφή",
      kicker: "Νέα σχολική χρονιά",
      headline: "Καλωσήρθες στην",
      highlight: "Κορυφή",
      sub: "Έναρξη μαθημάτων Σεπτέμβριο. Εγγραφές ανοιχτές για όλες τις τάξεις — Γυμνάσιο, Λύκειο, ΕΠΑΛ.",
      cta: { href: "/courses", label: "Δες όλα τα τμήματα" },
      secondaryCta: { href: "/epikoinonia", label: "Κλείσε ραντεβού" },
      overlayClass: OVERLAYS.autumn,
    },
    {
      image: HYBRID,
      alt: "Υβριδική διδασκαλία στο Κορυφή",
      kicker: "Πώς δουλεύουμε",
      headline: "Δια ζώσης ή online,",
      highlight: "το ίδιο μάθημα",
      sub: "Υβριδικές αίθουσες — επιλέγεις πώς θα παρακολουθήσεις ανάλογα με τη μέρα σου.",
      cta: { href: "/online-mathimata", label: "Δες τη μέθοδο" },
      overlayClass: OVERLAYS.autumn,
    },
  ],
  "winter-exams": [
    {
      image: HYBRID,
      alt: "Χειμερινή εντατική προετοιμασία",
      kicker: "Χειμώνας — εντατική προετοιμασία",
      headline: "Κάθε ώρα μελέτης",
      highlight: "μετράει",
      sub: "Στοχευμένη υποστήριξη για διαγωνίσματα και τετραμηνιαία. Σύγχρονη και εξ αποστάσεως διδασκαλία.",
      cta: { href: "/courses", label: "Δες τα μαθήματα" },
      secondaryCta: { href: "/online-mathimata", label: "Online μαθήματα" },
      overlayClass: OVERLAYS.winter,
    },
    {
      image: KALLONI,
      alt: "Φροντιστήριο Κορυφή — έδρα στην Καλλονή Λέσβου",
      kicker: "Στην Καλλονή Λέσβου από το 2019",
      headline: "Μικρά τμήματα,",
      highlight: "προσωπική παρακολούθηση",
      sub: "Έως 5 μαθητές ανά τμήμα — όσο χρειάζεται για να μάθεις σωστά.",
      cta: { href: "/gia-emas", label: "Γνώρισέ μας" },
      overlayClass: OVERLAYS.winter,
    },
  ],
};

export function pickSeason(date = new Date()): SeasonKey {
  const m = date.getMonth(); // 0..11
  if (m === 10 || m === 11 || m === 0 || m === 1) return "winter-exams";
  if (m >= 2 && m <= 4) return "spring-panellinies";
  if (m >= 5 && m <= 7) return "summer";
  return "autumn-start";
}

export function SeasonalHero({ season }: { season?: SeasonKey } = {}) {
  const slides = SEASONS[season ?? pickSeason()];
  return <HeroCarousel slides={slides} />;
}
