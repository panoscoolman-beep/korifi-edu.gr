/**
 * Μόνιμα (308) redirects για τα URLs του παλιού WordPress site (προ 5/2026).
 *
 * Γιατί: το Search Console (email 7/8/2026) εντόπισε "Δεν βρέθηκε (404)" σε
 * παλιά indexed URLs. Τα πολύτιμα ανακατευθύνονται μόνιμα στη νέα δομή —
 * τα spam/junk URLs του παραβιασμένου παλιού WP (casino, 1xbet κ.λπ.)
 * ΣΚΟΠΙΜΑ μένουν 404 για να αποκαταλογοποιηθούν.
 *
 * ΠΡΟΣΟΧΗ: το Next.js ταιριάζει τα redirect sources με το percent-encoded
 * pathname, γι' αυτό τα ελληνικά slugs είναι γραμμένα κωδικοποιημένα (%CE...).
 * Το αποκωδικοποιημένο κείμενο υπάρχει δίπλα σε σχόλιο.
 *
 * Πηγή αντιστοίχισης άρθρων: scripts/scrape/articles.json (slug_original → slug_ascii).
 */

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

// Παλιά ελληνικά permalinks άρθρων (root-level στο WP) → νέο /blog/<ascii-slug>
const WP_ARTICLE_SLUGS: ReadonlyArray<readonly [string, string]> = [
  ["%CE%B7-%CE%B5%CF%80%CE%B1%CE%BD%CE%B1%CF%83%CF%84%CE%B1%CF%84%CE%B9%CE%BA%CE%AE-%CF%80%CF%81%CE%BF%CF%83%CE%B5%CE%B4%CE%AC%CF%86%CE%B9%CF%83%CE%B7-%CF%84%CE%BF%CF%85-super-heavy-%CF%84%CE%B7%CF%82-spa", "i-epanastatiki-prosedafisi-toy-super-heavy-tis-spa"], // η-επαναστατική-προσεδάφιση-του-super-heavy-της-spa
  ["%CF%80%CF%81%CE%BF%CF%83%CE%BF%CE%BC%CE%BF%CE%AF%CF%89%CF%83%CE%B7-%CE%BC%CE%B1%CE%B8%CE%B7%CE%BC%CE%B1%CF%84%CE%B9%CE%BA%CF%8E%CE%BD-%CE%BC%CE%AC%CE%B9%CE%BF%CF%82-2024", "prosomoiosi-mathimatikon-maios-2024"], // προσομοίωση-μαθηματικών-μάιος-2024
  ["%CE%B1%CF%80%CF%8C-%CF%84%CE%B9%CF%82-%CE%B4%CE%B9%CE%B1%CE%BA%CE%BF%CF%80%CE%AD%CF%82-%CF%83%CF%84%CE%B7-%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%BA%CE%AE-%CF%80%CE%AF%CF%83%CF%84%CE%B1-%CE%BD%CE%AD", "apo-tis-diakopes-sti-scholiki-pista-ne"], // από-τις-διακοπές-στη-σχολική-πίστα-νέ
  ["%CE%B4%CE%B9%CE%B1%CF%87%CE%B5%CE%AF%CF%81%CE%B9%CF%83%CE%B7-%CF%84%CE%BF%CF%85-%CF%87%CF%81%CF%8C%CE%BD%CE%BF%CF%85-%CE%AD%CE%BD%CE%B1%CF%82-%CE%BF%CE%B4%CE%B7%CE%B3%CF%8C%CF%82-%CE%B3%CE%B9%CE%B1", "diacheirisi-toy-chronoy-enas-odigos-gia"], // διαχείριση-του-χρόνου-ένας-οδηγός-για
  ["%CE%B7-%CE%BC%CE%B5%CF%84%CE%AC%CE%B2%CE%B1%CF%83%CE%B7-%CE%B1%CF%80%CF%8C-%CF%84%CE%BF-%CE%B3%CF%85%CE%BC%CE%BD%CE%AC%CF%83%CE%B9%CE%BF-%CF%83%CF%84%CE%BF-%CE%BB%CF%8D%CE%BA%CE%B5%CE%B9%CE%BF", "i-metavasi-apo-to-gymnasio-sto-lykeio"], // η-μετάβαση-από-το-γυμνάσιο-στο-λύκειο
  ["%CE%B3%CE%B5%CE%BD%CE%B9%CE%BA%CF%8C-%CE%AE-%CE%B5%CF%80%CE%B1%CE%B3%CE%B3%CE%B5%CE%BB%CE%BC%CE%B1%CF%84%CE%B9%CE%BA%CF%8C-%CE%BB%CF%8D%CE%BA%CE%B5%CE%B9%CE%BF-%CE%BC%CE%B9%CE%B1-%CF%80%CF%81%CE%BF", "geniko-i-epaggelmatiko-lykeio-mia-pro"], // γενικό-ή-επαγγελματικό-λύκειο-μια-προ
  ["webinar-%CF%83%CF%85%CE%BC%CF%80%CE%AE%CF%81%CF%89%CF%83%CE%B7%CF%82-%CE%BC%CE%B7%CF%87%CE%B1%CE%BD%CE%BF%CE%B3%CF%81%CE%B1%CF%86%CE%B9%CE%BA%CE%BF%CF%8D", "webinar-sympirosis-michanografikoy"], // webinar-συμπήρωσης-μηχανογραφικού
  ["%CE%B1%CE%BE%CE%B9%CE%BF%CF%80%CE%BF%CE%AF%CE%B7%CF%83%CE%B5-%CF%83%CF%84%CE%BF-%CE%AD%CF%80%CE%B1%CE%BA%CF%81%CE%BF-%CF%84%CE%BF-%CE%BA%CE%B1%CE%BB%CE%BF%CE%BA%CE%B1%CE%AF%CF%81%CE%B9-%CF%83%CE%BF", "axiopoiise-sto-epakro-to-kalokairi-so"], // αξιοποίησε-στο-έπακρο-το-καλοκαίρι-σο
  ["%CE%B7-%CE%B8%CE%B5%CF%89%CF%81%CE%AF%CE%B1-%CF%84%CE%B7%CF%82-%CF%83%CF%87%CE%B5%CF%84%CE%B9%CE%BA%CF%8C%CF%84%CE%B7%CF%84%CE%B1%CF%82-%CF%84%CE%BF%CF%85-einstein-%CE%BA%CE%B1%CE%B9-%CE%BF-%CF%87", "i-theoria-tis-schetikotitas-toy-einstein-kai-o-ch"], // η-θεωρία-της-σχετικότητας-του-einstein-και-ο-χ
  ["%CE%BD%CE%B5%CF%85%CF%84%CF%8E%CE%BD%CE%B5%CE%B9%CE%B1-%CE%B2%CE%B1%CF%81%CF%8D%CF%84%CE%B7%CF%84%CE%B1-%CE%BA%CE%B1%CE%B9-%CE%B3%CE%B5%CE%BD%CE%B9%CE%BA%CE%AE-%CE%B8%CE%B5%CF%89%CF%81%CE%AF%CE%B1", "neytoneia-varytita-kai-geniki-theoria"], // νευτώνεια-βαρύτητα-και-γενική-θεωρία
  ["elementor-12592", "elementor-12592"], // elementor-12592
  ["%CF%80%CF%85%CE%B8%CE%B1%CE%B3%CF%8C%CF%81%CE%B5%CE%B9%CE%BF-%CE%B8%CE%B5%CF%8E%CF%81%CE%B7%CE%BC%CE%B1-%CF%80%CF%8E%CF%82-%CE%BC%CE%B9%CE%B1-%CE%B1%CF%81%CF%87%CE%B1%CE%AF%CE%B1-%CE%BC%CE%B1%CE%B8", "pythagoreio-theorima-pos-mia-archaia-math"], // πυθαγόρειο-θεώρημα-πώς-μια-αρχαία-μαθ
  ["%CF%80%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%AE%CE%BD%CE%B9%CE%B5%CF%82-%CE%BF%CE%B4%CE%B7%CE%B3%CE%AF%CE%B5%CF%82-%CE%B5%CF%80%CE%B9%CE%B2%CE%AF%CF%89%CF%83%CE%B7%CF%82-%CE%B3%CE%B9%CE%B1-%CF%84%CE%BF", "panellinies-odigies-epiviosis-gia-to"], // πανελλήνιες-οδηγίες-επιβίωσης-για-το
  ["%CE%B5%CE%BA%CE%B4%CF%81%CE%BF%CE%BC%CE%AE-%CF%83%CF%84%CE%BF-%CE%BC%CE%BF%CF%85%CF%83%CE%B5%CE%AF%CE%BF-%CF%86%CF%85%CF%83%CE%B9%CE%BA%CE%AE%CF%82-%CE%B9%CF%83%CF%84%CE%BF%CF%81%CE%AF%CE%B1%CF%82", "ekdromi-sto-moyseio-fysikis-istorias"], // εκδρομή-στο-μουσείο-φυσικής-ιστορίας
  ["%CE%B4%CE%B5%CE%BB%CF%84%CE%AF%CE%BF-%CF%84%CF%8D%CF%80%CE%BF%CF%85-%CE%BA%CE%B1%CE%B9-%CE%B1%CF%80%CF%8C%CF%88%CE%B5%CE%B9%CF%82-%CE%BC%CE%B1%CE%B8%CE%B7%CF%84%CF%8E%CE%BD-%CE%BC%CE%B1%CF%82-%CE%B3", "deltio-typoy-kai-apopseis-mathiton-mas-g"], // δελτίο-τύπου-και-απόψεις-μαθητών-μας-γ
  ["webinar-%CE%B4%CE%B9%CE%B1%CF%87%CE%B5%CE%AF%CF%81%CE%B9%CF%83%CE%B7%CF%82-%CF%87%CF%81%CF%8C%CE%BD%CE%BF%CF%85", "webinar-diacheirisis-chronoy"], // webinar-διαχείρισης-χρόνου
  ["%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%B1%CF%83%CE%BC%CE%BF%CF%83-%CF%84%CE%B7%CF%83-%CF%80%CF%81%CE%BF%CF%83%CE%B8%CE%B7%CE%BA%CE%B7%CF%83-%CE%BD%CE%B5%CE%B1%CF%83-%CF%85%CE%BB%CE%B7%CF%83-%CF%83%CF%84", "scholiasmos-tis-prosthikis-neas-ylis-st"], // σχολιασμοσ-τησ-προσθηκησ-νεασ-υλησ-στ
  ["%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%B1%CF%83%CE%BC%CF%8C%CF%82-%CE%B8%CE%B5%CE%BC%CE%AC%CF%84%CF%89%CE%BD-%CF%80%CE%BB%CE%B7%CF%81%CE%BF%CF%86%CE%BF%CF%81%CE%B9%CE%BA%CE%AE%CF%82-%CF%80%CE%B1%CE%BD", "scholiasmos-thematon-pliroforikis-pan"], // σχολιασμός-θεμάτων-πληροφορικής-παν
  ["%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%B1%CF%83%CE%BC%CF%8C%CF%82-%CE%B8%CE%B5%CE%BC%CE%AC%CF%84%CF%89%CE%BD-%CE%B1%CF%81%CF%87%CE%B1%CE%AF%CE%B1-%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%BA%CE%AC-%CF%80", "scholiasmos-thematon-archaia-ellinika-p"], // σχολιασμός-θεμάτων-αρχαία-ελληνικά-π
  ["%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%B1%CF%83%CE%BC%CF%8C%CF%82-%CE%B8%CE%B5%CE%BC%CE%AC%CF%84%CF%89%CE%BD-%CE%BC%CE%B1%CE%B8%CE%B7%CE%BC%CE%B1%CF%84%CE%B9%CE%BA%CF%8E%CE%BD-2021", "scholiasmos-thematon-mathimatikon-2021"], // σχολιασμός-θεμάτων-μαθηματικών-2021
  ["%CF%83%CF%87%CE%BF%CE%BB%CE%B9%CE%B1%CF%83%CE%BC%CF%8C%CF%82-%CE%BA%CE%B1%CE%B9-%CE%BB%CF%8D%CF%83%CE%B5%CE%B9%CF%82-%CE%B8%CE%B5%CE%BC%CE%AC%CF%84%CF%89%CE%BD-%CE%B2%CE%B9%CE%BF%CE%BB%CE%BF%CE%B3", "scholiasmos-kai-lyseis-thematon-violog"], // σχολιασμός-και-λύσεις-θεμάτων-βιολογ
  ["%CE%B4%CE%B5%CE%BB%CF%84%CE%AF%CE%BF-%CF%84%CF%8D%CF%80%CE%BF%CF%85", "deltio-typoy"], // δελτίο-τύπου
  ["%CE%B4%CE%B9%CE%B1%CE%B4%CE%B9%CE%BA%CF%84%CF%85%CE%B1%CE%BA%CE%AE-%CF%83%CF%85%CE%BD%CE%AC%CE%BD%CF%84%CE%B7%CF%83%CE%B7-%CE%BC%CE%B5-%CF%84%CE%BF%CE%BD-%CE%B3%CE%B9%CE%AC%CE%BD%CE%BD%CE%B7", "diadiktyaki-synantisi-me-ton-gianni"], // διαδικτυακή-συνάντηση-με-τον-γιάννη
  ["%CF%80%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%B9%CE%B5%CF%83-%CE%B5%CE%BE%CE%B5%CF%84%CE%B1%CF%83%CE%B5%CE%B9%CF%83-%CE%B6%CF%89%CE%B7%CF%83", "panellinies-exetaseis-zois"], // πανελληνιεσ-εξετασεισ-ζωησ
  ["%CE%B7-%CE%BA%CE%BF%CF%85%CF%81%CF%84%CE%AF%CE%BD%CE%B1-%CF%84%CE%BF%CF%85-%CE%AC%CE%B3%CF%87%CE%BF%CF%85%CF%82", "i-koyrtina-toy-agchoys"], // η-κουρτίνα-του-άγχους
  ["%CE%AD%CF%81%CF%87%CE%BF%CE%BD%CF%84%CE%B1%CE%B9-%CF%80%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%AE%CE%BD%CE%B9%CE%B5%CF%82-%CF%84%CE%B9-%CF%80%CF%81%CE%AD%CF%80%CE%B5%CE%B9-%CE%BD%CE%B1-%CF%86%CE%AC%CF%89", "erchontai-panellinies-ti-prepei-na-fao"], // έρχονται-πανελλήνιες-τι-πρέπει-να-φάω
  ["%CE%B4%CE%B9%CE%B1%CE%B4%CE%B9%CE%BA%CF%84%CF%85%CE%B1%CE%BA%CF%8C-%CF%80%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%B1%CE%B4%CE%B9%CE%BA%CF%8C-%CF%83%CE%B5%CE%BC%CE%B9%CE%BD%CE%AC%CF%81%CE%B9%CE%BF", "diadiktyako-panelladiko-seminario"], // διαδικτυακό-πανελλαδικό-σεμινάριο
  ["%CE%B4%CE%B9%CE%B1%CE%B3%CF%89%CE%BD%CE%B9%CF%83%CE%BC%CE%B1-%CF%80%CF%81%CE%BF%CF%83%CE%BF%CE%BC%CE%BF%CE%B9%CF%89%CF%83%CE%B7%CF%82-%CE%B2%CE%B9%CE%BF%CE%BB%CE%BF%CE%B3%CE%B9%CE%B1-%CE%B3-%CE%BB", "diagonisma-prosomoiosis-viologia-g-l"], // διαγωνισμα-προσομοιωσης-βιολογια-γ-λ
  ["%CE%BF-%CE%B5%CF%80%CE%B9%CE%BC%CE%AD%CE%BD%CF%89%CE%BD-%CE%BD%CE%B9%CE%BA%CE%AC", "o-epimenon-nika"], // ο-επιμένων-νικά
  ["%CE%B4%CE%B9%CE%B1%CE%B4%CE%B9%CE%BA%CF%84%CF%85%CE%B1%CE%BA%CF%8C-%CF%83%CE%B5%CE%BC%CE%B9%CE%BD%CE%AC%CF%81%CE%B9%CE%BF-%CE%B7-%CF%80%CF%81%CE%BF%CE%B5%CF%84%CE%BF%CE%B9%CE%BC%CE%B1%CF%83%CE%AF", "diadiktyako-seminario-i-proetoimasi"], // διαδικτυακό-σεμινάριο-η-προετοιμασί
  ["%CE%B7-%CE%B5%CE%BC%CF%80%CE%B5%CE%B9%CF%81%CE%AF%CE%B1-%CE%BC%CE%BF%CF%85-%CE%BC%CE%B5-%CF%84%CE%BF%CE%BD-%CE%B1%CF%85%CF%84%CE%B9%CF%83%CE%BC%CF%8C", "i-empeiria-moy-me-ton-aytismo"], // η-εμπειρία-μου-με-τον-αυτισμό
  ["%CE%B4%CE%B9%CE%B1%CE%B4%CE%B9%CE%BA%CF%84%CF%85%CE%B1%CE%BA%CF%8C-%CF%83%CE%B5%CE%BC%CE%B9%CE%BD%CE%AC%CF%81%CE%B9%CE%BF-%CE%BF%CE%B9-%CE%B4%CF%81%CE%BF%CE%BC%CE%BF%CE%B9-%CE%B3%CE%B9%CE%B1-%CF%84", "diadiktyako-seminario-oi-dromoi-gia-t"], // διαδικτυακό-σεμινάριο-οι-δρομοι-για-τ
  ["%CE%B4%CE%B9%CE%B1%CF%84%CF%81%CE%BF%CF%86%CE%AE-%CE%BF-%CF%80%CE%BF%CE%BB%CF%8D%CF%84%CE%B9%CE%BC%CE%BF%CF%82-%CF%83%CF%8D%CE%BC%CE%BC%CE%B1%CF%87%CE%BF%CF%82-%CF%84%CF%89%CE%BD-%CF%80%CE%B1%CE%BD", "diatrofi-o-polytimos-symmachos-ton-pan"], // διατροφή-ο-πολύτιμος-σύμμαχος-των-παν
  ["%CE%BA%CE%AC%CE%BD%CE%B5-%CF%84%CE%BF-%CE%B4%CE%B9%CE%AC%CE%B2%CE%B1%CF%83%CE%BC%CE%AC-%CF%83%CE%BF%CF%85-%CF%80%CE%B1%CE%B9%CF%87%CE%BD%CE%B9%CE%B4%CE%AC%CE%BA%CE%B9", "kane-to-diavasma-soy-paichnidaki"], // κάνε-το-διάβασμά-σου-παιχνιδάκι
  ["%CF%84%CE%B1-%CE%B3%CE%B5%CE%BD%CE%AD%CE%B8%CE%BB%CE%B9%CE%B1-%CF%84%CE%B7%CF%82-%CF%84%CE%B7%CE%BB-%CE%B5%CE%BA%CF%80%CE%B1%CE%AF%CE%B4%CE%B5%CF%85%CF%83%CE%B7%CF%82", "ta-genethlia-tis-til-ekpaideysis"], // τα-γενέθλια-της-τηλ-εκπαίδευσης
];

// Παλιές αρχειακές διαδρομές WP (ταξινομίες/ημερομηνίες/σελιδοποίηση) → /blog
const WP_ARCHIVE_SOURCES: ReadonlyArray<string> = [
  "/category/:path*",
  "/tag/:path*",
  "/author/:path*",
  "/%CE%BA%CE%BF%CF%81%CF%85%CF%86%CE%AE-blog", // /κορυφή-blog
  "/%CE%BA%CE%BF%CF%81%CF%85%CF%86%CE%AE-blog/:page(\\d+)", // /κορυφή-blog/2
  "/%CE%B8%CE%AD%CE%BC%CE%B1%CF%84%CE%B1-%CF%80%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%AF%CF%89%CE%BD-:year(\\d{4})", // /θέματα-πανελληνίων-2016..2021
  "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})",
  "/:year(\\d{4})/:month(\\d{2})",
];

// Demo events του παλιού WP theme (Eduma) που είχαν καταλογοποιηθεί
const WP_DEMO_EVENT_SLUGS = [
  "build-education-website-using-wordpress",
  "education-autumn-tour-2016",
  "eduma-autumn-2015",
  "eduma-autumn-2016",
  "eduma-summer-2017",
  "elegant-light-box-paper-cut-dioramas-1",
  "good-intentions-or-good-results",
  "summer-school-2015",
].join("|");

export const legacyRedirects: Redirect[] = [
  ...WP_ARTICLE_SLUGS.map(([oldSlugEncoded, newSlug]) => ({
    source: `/${oldSlugEncoded}`,
    destination: `/blog/${newSlug}`,
    permanent: true,
  })),
  ...WP_ARCHIVE_SOURCES.map((source) => ({
    source,
    destination: "/blog",
    permanent: true,
  })),
  {
    source: "/course-category/:grade(alikeiou|blikeiou|glikeiou|gimnasio|epal)",
    destination: "/:grade",
    permanent: true,
  },
  {
    source: `/events/:slug(${WP_DEMO_EVENT_SLUGS})`,
    destination: "/events",
    permanent: true,
  },
];
