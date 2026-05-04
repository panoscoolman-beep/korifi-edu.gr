"""Rewrite the grade-program + online-mathimata pages with rich bento-style
content (matching the /epaggelmatikos-prosanatolismos look — gradient banner,
numbered/icon cards, bordered subject tables, bottom CTA).

Run: python scripts/redesign_grade_pages.py

The HTML inside content_md is passed through `rehype-raw` (already enabled in
src/components/Markdown.tsx), so Tailwind utility classes work as-is.
"""
from __future__ import annotations
import sys, json, urllib.request, urllib.error
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
env: dict[str, str] = {}
for ln in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
    ln = ln.strip()
    if not ln or ln.startswith("#") or "=" not in ln:
        continue
    k, _, v = ln.partition("=")
    env[k.strip()] = v.strip().strip('"').strip("'")
URL     = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]


# -----------------------------------------------------------------------------
# Reusable building blocks
# -----------------------------------------------------------------------------
def banner(kicker: str, title: str, sub: str) -> str:
    return f'''<div class="not-prose mb-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg sm:p-10">
  <p class="text-sm font-semibold uppercase tracking-wider text-amber-300">{kicker}</p>
  <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
  <p class="mt-2 text-lg text-brand-100">{sub}</p>
</div>'''


def feature_card(num: str, title: str, body: str, accent: str = "brand") -> str:
    """num can be a digit '1' or an emoji '⚛️'."""
    bg = "bg-brand-600 text-white" if accent == "brand" else "bg-amber-400 text-slate-900"
    return f'''<div class="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
  <div class="flex items-center gap-3">
    <span class="flex h-10 w-10 items-center justify-center rounded-full {bg} text-base font-bold">{num}</span>
    <h3 class="text-lg font-bold text-slate-900">{title}</h3>
  </div>
  <p class="mt-3 text-sm text-slate-600">{body}</p>
</div>'''


def cta_box(title: str, sub: str, primary: tuple[str, str], secondary: tuple[str, str] | None = None) -> str:
    secondary_html = ""
    if secondary:
        secondary_html = f'''<a href="{secondary[0]}" class="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-7 py-3.5 text-base font-semibold text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white">{secondary[1]}</a>'''
    return f'''<div class="not-prose mt-12 rounded-2xl bg-gradient-to-r from-brand-50 via-amber-50 to-brand-50 p-8 text-center">
  <p class="text-lg font-medium text-slate-700">{title}</p>
  <p class="mt-1 text-sm text-slate-600">{sub}</p>
  <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
    <a href="{primary[0]}" class="inline-flex items-center gap-2 rounded-full bg-amber-300 px-7 py-3.5 text-base font-semibold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg">{primary[1]}</a>
    {secondary_html}
  </div>
</div>'''


def grade_card(badge: str, label: str, intro: str, table_md: str, accent_color: str = "brand-100") -> str:
    """A grade-section card: colored top stripe, intro, embedded subjects table."""
    return f'''<section class="not-prose mb-8 overflow-hidden rounded-2xl border border-{accent_color} bg-white shadow-sm">
  <header class="bg-gradient-to-r from-brand-700 to-brand-800 px-6 py-4 sm:px-8">
    <p class="text-xs font-semibold uppercase tracking-widest text-amber-300">{badge}</p>
    <h3 class="mt-1 text-2xl font-bold text-white">{label}</h3>
  </header>
  <div class="px-6 py-6 sm:px-8">
    <p class="text-sm leading-relaxed text-slate-700">{intro}</p>
{table_md}
  </div>
</section>'''


def subjects_table(rows: list[tuple[str, int | str]], total_label: str = "Σύνολο") -> str:
    total = sum(int(h) for _, h in rows if isinstance(h, int) or (isinstance(h, str) and h.isdigit()))
    body_rows = "\n".join(
        f'      <tr class="border-b border-slate-100 last:border-0"><td class="py-2 pr-4 text-slate-700">{name}</td><td class="py-2 text-right font-medium text-slate-900">{hours}</td></tr>'
        for name, hours in rows
    )
    return f'''    <div class="mt-5 overflow-hidden rounded-lg border border-brand-100">
      <table class="w-full text-sm">
        <thead class="bg-brand-50 text-xs uppercase tracking-wider text-brand-800">
          <tr><th class="py-2 pl-4 text-left">Μάθημα</th><th class="py-2 pr-4 text-right">Ώρες</th></tr>
        </thead>
        <tbody class="bg-white">
{body_rows}
          <tr class="bg-brand-50/50"><td class="py-2 pl-4 font-bold text-brand-900">{total_label}</td><td class="py-2 pr-4 text-right font-bold text-brand-900">{total}</td></tr>
        </tbody>
      </table>
    </div>'''


# -----------------------------------------------------------------------------
# Page contents
# -----------------------------------------------------------------------------
def page_online_mathimata() -> str:
    return banner(
        "e-Κορυφή",
        "Μαθαίνεις από οπουδήποτε",
        "Με την ίδια ποιότητα όπως στη δια ζώσης τάξη.",
    ) + """

Στο **Κορυφή** προσφέρουμε εξ αποστάσεως μαθήματα για μαθητές που, για οποιονδήποτε λόγο, δεν μπορούν να παρακολουθήσουν δια ζώσης. Είτε μένετε σε άλλο χωριό της Λέσβου, είτε σε άλλη πόλη, είτε αντιμετωπίζετε έκτακτο πρόβλημα — η μάθηση δεν σταματά.

## Πώς λειτουργεί

<div class="not-prose mt-6 grid gap-5 sm:grid-cols-2">
""" + feature_card("🎥", "Σύγχρονη διδασκαλία", "Live μαθήματα μέσω επαγγελματικής πλατφόρμας τηλεδιάσκεψης. Ο καθηγητής βλέπει και αλληλεπιδρά με τον μαθητή σε πραγματικό χρόνο, όπως στην τάξη.") + feature_card("📚", "Διαμοιρασμός υλικού", "Σημειώσεις, ασκήσεις και θέματα πανελλαδικών αποστέλλονται ψηφιακά πριν και μετά το μάθημα.") + feature_card("⏰", "Ευέλικτο πρόγραμμα", "Επιλέγουμε μαζί ώρες που ταιριάζουν στις υποχρεώσεις σας — απογεύματα, βράδια ή Σαββατοκύριακα.") + feature_card("📊", "Παρακολούθηση προόδου", "Τακτικά διαγωνίσματα και ενημέρωση γονέων, όπως ακριβώς και στα δια ζώσης τμήματα.") + """
</div>

## Για ποιους ταιριάζει

<div class="not-prose mt-6 grid gap-4 sm:grid-cols-2">
  <div class="rounded-xl border border-brand-100 bg-brand-50/40 p-5">
    <p class="font-semibold text-brand-900">🎒 Μαθητές Γυμνασίου, Λυκείου & ΕΠΑΛ</p>
    <p class="mt-1 text-sm text-slate-600">Με προσωπική παρακολούθηση από έμπειρους καθηγητές.</p>
  </div>
  <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
    <p class="font-semibold text-amber-900">🎯 Υποψήφιοι Πανελληνίων</p>
    <p class="mt-1 text-sm text-slate-700">Εντατική, στοχευμένη προετοιμασία.</p>
  </div>
  <div class="rounded-xl border border-brand-100 bg-brand-50/40 p-5">
    <p class="font-semibold text-brand-900">🌍 Μαθητές εκτός Καλλονής</p>
    <p class="mt-1 text-sm text-slate-600">Ποιότητα Κορυφής χωρίς γεωγραφικό περιορισμό.</p>
  </div>
  <div class="rounded-xl border border-brand-100 bg-brand-50/40 p-5">
    <p class="font-semibold text-brand-900">🏥 Έκτακτες ανάγκες</p>
    <p class="mt-1 text-sm text-slate-600">Ασθένεια, υποχρεώσεις — δεν μένεις πίσω.</p>
  </div>
</div>

## Τι θα χρειαστείτε

<div class="not-prose mt-6 grid gap-3 sm:grid-cols-3">
  <div class="rounded-lg border border-slate-200 bg-white p-4 text-center"><p class="text-2xl">🌐</p><p class="mt-2 text-sm font-medium text-slate-900">Σταθερή σύνδεση internet</p></div>
  <div class="rounded-lg border border-slate-200 bg-white p-4 text-center"><p class="text-2xl">💻</p><p class="mt-2 text-sm font-medium text-slate-900">Υπολογιστή ή tablet</p></div>
  <div class="rounded-lg border border-slate-200 bg-white p-4 text-center"><p class="text-2xl">🔇</p><p class="mt-2 text-sm font-medium text-slate-900">Ήσυχος χώρος μελέτης</p></div>
</div>

""" + cta_box(
        "Έτοιμοι να ξεκινήσετε;",
        "Ας σχεδιάσουμε μαζί το πρόγραμμά σας.",
        ("/epikoinonia", "Επικοινωνία"),
        ("/courses", "Δες τα μαθήματα"),
    )


def page_gimnasio() -> str:
    return banner(
        "Πρόγραμμα Σπουδών Γυμνασίου",
        "Στέρεες βάσεις από νωρίς",
        "Α΄, Β΄ και Γ΄ Γυμνασίου — μικρά τμήματα, προσωπική παρακολούθηση.",
    ) + grade_card(
        "Α΄ Τάξη",
        "Α΄ Γυμνασίου",
        "Η Α΄ Γυμνασίου σηματοδοτεί τη μετάβαση από την πρωτοβάθμια στη δευτεροβάθμια εκπαίδευση. Είναι ιδιαίτερα σημαντικό η μετάβαση αυτή να είναι ομαλή και επιτυχημένη — η εμπειρία της επιτυχίας στο ξεκίνημα δίνει το κίνητρο να φτάσει το παιδί στην <em>Κορυφή</em>.",
        subjects_table([
            ("Αρχαία Ελληνική Γλώσσα και Γραμματεία", 2),
            ("Νέα Ελληνική Γλώσσα και Γραμματεία",  2),
            ("Μαθηματικά",                          2),
            ("Φυσική",                              1),
        ]),
    ) + grade_card(
        "Β΄ Τάξη",
        "Β΄ Γυμνασίου",
        "Ο μαθητής εμβαθύνει στην ύλη της προηγούμενης χρονιάς (Νέα Ελληνικά, Αρχαία, Μαθηματικά) και έρχεται σε επαφή με δύο νέα μαθήματα — τη <strong>Φυσική</strong> και τη <strong>Χημεία</strong>.",
        subjects_table([
            ("Αρχαία Ελληνική Γλώσσα και Γραμματεία", 2),
            ("Νέα Ελληνική Γλώσσα και Γραμματεία",  2),
            ("Μαθηματικά",                          2),
            ("Φυσική",                              1),
            ("Χημεία",                              1),
        ]),
    ) + grade_card(
        "Γ΄ Τάξη",
        "Γ΄ Γυμνασίου",
        "Η πιο απαιτητική τάξη του Γυμνασίου. Στόχος είναι αφενός η κατάκτηση όλης της ύλης της Γ΄ και αφετέρου το γέμισμα κάθε κενού από προηγούμενες τάξεις, ώστε η μετάβαση στο Λύκειο να γίνει με τον καλύτερο τρόπο.",
        subjects_table([
            ("Αρχαία Ελληνική Γλώσσα και Γραμματεία", 2),
            ("Νέα Ελληνική Γλώσσα και Γραμματεία",  2),
            ("Μαθηματικά",                          2),
            ("Φυσική",                              1),
            ("Χημεία",                              1),
        ]),
    ) + cta_box(
        "Θέλετε να μάθετε περισσότερα;",
        "Επικοινωνήστε μαζί μας ή δείτε τα διαθέσιμα μαθήματα.",
        ("/courses?subject=gimnasio", "Μαθήματα Γυμνασίου"),
        ("/epikoinonia", "Επικοινωνία"),
    )


def page_alikeiou() -> str:
    return banner(
        "Πρόγραμμα Σπουδών Α΄ Λυκείου",
        "Νέα αρχή — γερές βάσεις",
        "Α΄ Λυκείου: μετάβαση από Γυμνάσιο και πρώτη επαφή με την προετοιμασία για τις Πανελλαδικές.",
    ) + grade_card(
        "Α΄ Τάξη Γενικού Λυκείου",
        "Α΄ Λυκείου",
        "Η Α΄ Λυκείου σηματοδοτεί τη μετάβαση από το Γυμνάσιο στο Λύκειο και την προετοιμασία για τις Πανελλαδικές της Γ΄. Σε αυτή την τάξη ο μαθητής χτίζει τα κενά γνώσεων από το Γυμνάσιο για να επιτύχει στις εξετάσεις.",
        subjects_table([
            ("Άλγεβρα",                  3),
            ("Γεωμετρία",                1),
            ("Φυσική",                   2),
            ("Χημεία",                   2),
            ("Βιολογία",                 1),
            ("Αρχαία Ελληνική Γλώσσα",   2),
            ("Έκφραση — Έκθεση",         2),
        ]),
    ) + '''<div class="not-prose mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
  <p class="text-sm font-medium text-amber-900">📌 Τα μαθήματα προετοιμασίας για τις Πανελλαδικές Εξετάσεις γίνονται σε συνεννόηση με τον Διδάσκοντα Καθηγητή.</p>
</div>

''' + cta_box(
        "Θέλετε να ξεκινήσετε;",
        "Ραντεβού γνωριμίας ή πληροφορίες για τα τμήματα.",
        ("/courses?subject=alikeiou", "Μαθήματα Α΄ Λυκείου"),
        ("/epikoinonia", "Επικοινωνία"),
    )


def page_blikeiou() -> str:
    return banner(
        "Πρόγραμμα Σπουδών Β΄ Λυκείου",
        "Στρώνουμε τον δρόμο για τη Γ΄",
        "Β΄ Λυκείου: στοχευμένη προετοιμασία και επιλογή κατεύθυνσης.",
    ) + grade_card(
        "Β΄ Τάξη Γενικού Λυκείου",
        "Β΄ Λυκείου",
        "Η Β΄ Λυκείου σηματοδοτεί την προετοιμασία του μαθητή για τις Πανελλαδικές της Γ΄. Σε αυτήν την τάξη ξεκινά η προετοιμασία για την επόμενη σχολική χρονιά ώστε να επιτύχει στις εξετάσεις.",
        subjects_table([
            ("Άλγεβρα",                                                                    3),
            ("Γεωμετρία",                                                                  1),
            ("Μαθηματικά Κατεύθυνσης",                                                     1),
            ("Φυσική",                                                                     4),
            ("Χημεία",                                                                     2),
            ("Βιολογία",                                                                   1),
            ("Αρχαία Ελληνική Γλώσσα",                                                     2),
            ("Έκφραση — Έκθεση",                                                           2),
            ("Αρχές Οικονομικής Θεωρίας *",                                                2),
            ("Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον *",                        2),
        ]),
    ) + '''<div class="not-prose mt-6 grid gap-3 sm:grid-cols-2">
  <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
    <p class="text-sm font-semibold text-amber-900">📌 Σημείωση *</p>
    <p class="mt-1 text-sm text-slate-700">Τα μαθήματα προετοιμασίας Πανελλαδικών γίνονται σε συνεννόηση με τον Διδάσκοντα Καθηγητή.</p>
  </div>
  <div class="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
    <p class="text-sm font-semibold text-brand-900">📞 Διευκρινίσεις κατευθύνσεων</p>
    <p class="mt-1 text-sm text-slate-700">Επικοινωνήστε μαζί μας — τα μαθήματα διαφέρουν σε θετική και θεωρητική κατεύθυνση.</p>
  </div>
</div>

''' + cta_box(
        "Έτοιμοι για το επόμενο βήμα;",
        "Ας συζητήσουμε τις ανάγκες του μαθητή.",
        ("/courses?subject=blikeiou", "Μαθήματα Β΄ Λυκείου"),
        ("/epikoinonia", "Επικοινωνία"),
    )


def page_glikeiou() -> str:
    intro = banner(
        "Πρόγραμμα Σπουδών Γ΄ Λυκείου",
        "Πανελλήνιες — η καθοριστική χρονιά",
        "Στοχευμένη προετοιμασία ανά επιστημονικό πεδίο.",
    ) + """
Η Γ΄ Λυκείου είναι η χρονιά των **Πανελλαδικών εξετάσεων** που καθορίζει την είσοδο του μαθητή στην τριτοβάθμια εκπαίδευση και αποτελεί την πιο καθοριστική χρονιά της δευτεροβάθμιας. Οι έμπειροι καθηγητές της **Κορυφής** βοηθούν τον μαθητή να επιτύχει τους στόχους του μέσα από εντατική ενασχόληση, συστηματική μελέτη και προσομοιώσεις.

## Τα 4 Επιστημονικά Πεδία

<p class="text-sm text-slate-600">Το νέο σύστημα Πανελλαδικών χωρίζει τις σχολές σε 4 επιστημονικά πεδία. Επιλέξτε το αντίστοιχο για να δείτε τα εξεταστέα μαθήματα + τις ώρες ανά εβδομάδα.</p>

"""
    p1 = grade_card(
        "1ο Πεδίο",
        "Ανθρωπιστικών, Νομικών & Κοινωνικών Επιστημών",
        "Εξεταστέα μαθήματα: Αρχαία, Νεοελληνική Γλώσσα και Λογοτεχνία, Ιστορία, Λατινικά.",
        subjects_table([
            ("Νεοελληνική Γλώσσα και Λογοτεχνία", 3),
            ("Αρχαία",                            4),
            ("Ιστορία",                           2),
            ("Λατινικά",                          2),
        ], total_label="Σύνολο Ωρών/Εβδομάδα"),
    )
    p2 = grade_card(
        "2ο Πεδίο",
        "Θετικών & Τεχνολογικών Επιστημών",
        "Εξεταστέα μαθήματα: Μαθηματικά, Φυσική, Χημεία, Νεοελληνική Γλώσσα και Λογοτεχνία.",
        subjects_table([
            ("Νεοελληνική Γλώσσα και Λογοτεχνία", 3),
            ("Μαθηματικά",                        5),
            ("Φυσική",                            4),
            ("Χημεία",                            5),
        ], total_label="Σύνολο Ωρών/Εβδομάδα"),
    )
    p3 = grade_card(
        "3ο Πεδίο",
        "Επιστημών Υγείας & Ζωής",
        "Εξεταστέα μαθήματα: Βιολογία, Φυσική, Χημεία, Νεοελληνική Γλώσσα και Λογοτεχνία.",
        subjects_table([
            ("Νεοελληνική Γλώσσα και Λογοτεχνία", 3),
            ("Χημεία",                            5),
            ("Φυσική",                            4),
            ("Βιολογία",                          3),
        ], total_label="Σύνολο Ωρών/Εβδομάδα"),
    )
    p4 = grade_card(
        "4ο Πεδίο",
        "Επιστημών Οικονομίας & Πληροφορικής",
        "Εξεταστέα μαθήματα: Μαθηματικά, ΑΟΘ, ΑΕΠΠ, Νεοελληνική Γλώσσα και Λογοτεχνία.",
        subjects_table([
            ("Νεοελληνική Γλώσσα και Λογοτεχνία",  3),
            ("Μαθηματικά",                         5),
            ("Αρχές Οικονομικής Θεωρίας",          2),
            ("Ανάπτυξη Εφαρμογών (ΑΕΠΠ)",          3),
        ], total_label="Σύνολο Ωρών/Εβδομάδα"),
    )

    note = '''<div class="not-prose mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
  <p class="text-sm font-medium text-amber-900">📌 Οι ώρες ανά εβδομάδα είναι ενδεικτικές και τροποποιούνται ανάλογα με τις ανάγκες του τμήματος, κατόπιν συνεννοήσεως με τον Διδάσκοντα Καθηγητή.</p>
</div>

'''

    return intro + p1 + p2 + p3 + p4 + note + cta_box(
        "Έτοιμοι για τις Πανελλήνιες;",
        "Επικοινωνήστε για ραντεβού ή δείτε τα διαθέσιμα μαθήματα.",
        ("/courses?subject=glikeiou", "Μαθήματα Γ΄ Λυκείου"),
        ("/epaggelmatikos-prosanatolismos", "Επαγγελματικός Προσανατολισμός"),
    )


def page_epal() -> str:
    intro = banner(
        "Πρόγραμμα Σπουδών ΕΠΑΛ",
        "Επαγγελματικό Λύκειο",
        "Α΄, Β΄ και Γ΄ ΕΠΑΛ — γενική παιδεία, τομείς, ειδικότητες.",
    )

    a_epal = grade_card(
        "Α΄ Τάξη",
        "Α΄ ΕΠΑΛ — Τάξη Βασικών Δεξιοτήτων",
        "Αποκτώνται γενικές γνώσεις και δεξιότητες με κοινά μαθήματα για όλους τους μαθητές. Διδάσκονται μαθήματα Γενικής Παιδείας (22 ώρες), Προσανατολισμού (7 ώρες) και 3 μαθήματα Επιλογής (6 ώρες) — Σύνολο: 35 ώρες.",
        subjects_table([
            ("Αρχαία Ελληνική Γλώσσα και Γραμματεία", 2),
            ("Νέα Ελληνική Γλώσσα και Γραμματεία",   2),
            ("Μαθηματικά",                            3),
            ("Φυσική",                                3),
            ("Χημεία",                                3),
        ]),
    )

    b_epal = '''<section class="not-prose mb-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
  <header class="bg-gradient-to-r from-brand-700 to-brand-800 px-6 py-4 sm:px-8">
    <p class="text-xs font-semibold uppercase tracking-widest text-amber-300">Β΄ Τάξη</p>
    <h3 class="mt-1 text-2xl font-bold text-white">Β΄ ΕΠΑΛ — Επαγγελματικοί Τομείς</h3>
  </header>
  <div class="px-6 py-6 sm:px-8">
    <p class="text-sm leading-relaxed text-slate-700">Τάξη Επαγγελματικών Τομέων που διαχωρίζεται σε τομείς σπουδών. Οι μαθητές της Α΄ εντάσσονται με αίτησή τους σε όποιο τομέα της Β΄ επιθυμούν. Διδάσκονται μαθήματα Γενικής Παιδείας (12 ώρες) κοινά για όλους και μαθήματα Επαγγελματικών Τομέων (θεωρητικά + εργαστηριακά, 23 ώρες). <strong>Σύνολο: 35 ώρες</strong>.</p>
    <p class="mt-3 text-sm font-medium text-brand-800">Οι μαθητές επιλέγουν έναν από τους <strong>9 Τομείς</strong>:</p>
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">1ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">🌱 Γεωπονίας, Τροφίμων &amp; Περιβάλλοντος</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Φυτικής Παραγωγής</li><li>Ζωικής Παραγωγής</li><li>Τεχνολογίας Τροφίμων &amp; Ποτών</li><li>Ανθοκομίας &amp; Αρχ. Τοπίου</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">2ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">📊 Διοίκησης &amp; Οικονομίας</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Διοίκησης &amp; Οικονομικών</li><li>Τουριστικών Επιχειρήσεων</li><li>Εμπορίας &amp; Διαφήμισης</li><li>Αποθήκης &amp; Εφοδιασμού</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">3ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">🏗️ Δομικών Έργων &amp; Σχεδιασμού</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Δομικών Έργων &amp; Γεωπληροφορικής</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">4ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">🎨 Εφαρμοσμένων Τεχνών</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Γραφικών Τεχνών</li><li>Αργυροχρυσοχοΐας</li><li>Συντήρησης Έργων Τέχνης</li><li>Σχεδίασης Ενδύματος</li><li>Διακόσμησης Εσωτ. Χώρων</li><li>Επιπλοποιίας — Ξυλογλυπτικής</li></ul>
      </div>
      <div class="rounded-lg border-2 border-amber-300 bg-amber-50/80 p-4">
        <p class="text-xs font-semibold text-amber-700">5ος Τομέας · Διαθέσιμος</p>
        <p class="mt-1 text-sm font-bold text-slate-900">⚡ Ηλεκτρολογίας, Ηλεκτρονικής &amp; Αυτοματισμού</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-700"><li>Ηλεκτρονικών Συστημάτων &amp; Δικτύων</li><li>Ηλεκτρολογικών Εγκαταστάσεων</li><li>Αυτοματισμού</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">6ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">⚙️ Μηχανολογίας</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Μηχανολογικών Εγκαταστάσεων</li><li>Θερμικών &amp; Υδραυλικών</li><li>Ψύξης &amp; Κλιματισμού</li><li>Οχημάτων / Αεροσκαφών</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">7ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">⚓ Ναυτιλιακών Επαγγελμάτων</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Πλοίαρχος Εμπορικού Ναυτικού</li><li>Μηχανικός Εμπορικού Ναυτικού</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">8ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">💻 Πληροφορικής</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Εφαρμογών Πληροφορικής</li><li>Η/Υ &amp; Δικτύων Η/Υ</li></ul>
      </div>
      <div class="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
        <p class="text-xs font-semibold text-brand-700">9ος Τομέας</p>
        <p class="mt-1 text-sm font-bold text-slate-900">⚕️ Υγείας — Πρόνοιας — Ευεξίας</p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-xs text-slate-600"><li>Βοηθός Νοσηλευτή</li><li>Βρεφονηπιοκόμων</li><li>Φυσικοθεραπείας</li></ul>
      </div>
    </div>
  </div>
</section>

'''

    g_epal = grade_card(
        "Γ΄ Τάξη",
        "Γ΄ ΕΠΑΛ — Επαγγελματικές Ειδικότητες",
        "Τάξη Επαγγελματικών Ειδικοτήτων που διαχωρίζεται σε ειδικότητες. Οι μαθητές της Β΄ εντάσσονται με αίτησή τους σε οποιαδήποτε ειδικότητα του τομέα που παρακολούθησαν. Διδάσκονται μαθήματα Γενικής Παιδείας (12 ώρες) κοινά για όλους και μαθήματα Ειδικότητας (θεωρητικά + εργαστηριακά, 23 ώρες). <strong>Σύνολο: 35 ώρες</strong>.",
        subjects_table([
            ("Έκθεση και Λογοτεχνία",   2),
            ("Μαθηματικά",              3),
            ("1ο μάθημα ειδικότητας",   2),
            ("2ο μάθημα ειδικότητας",   2),
        ]),
    )

    return intro + a_epal + b_epal + g_epal + cta_box(
        "Ψάχνετε για το ΕΠΑΛ που σας ταιριάζει;",
        "Επικοινωνήστε μαζί μας — διαθέτουμε μαθήματα ειδικότητας Ηλεκτρολόγων.",
        ("/courses?subject=epal", "Μαθήματα ΕΠΑΛ"),
        ("/epikoinonia", "Επικοινωνία"),
    )


# -----------------------------------------------------------------------------
# Apply
# -----------------------------------------------------------------------------
PAGES = {
    "online-mathimata": page_online_mathimata(),
    "gimnasio":         page_gimnasio(),
    "alikeiou":         page_alikeiou(),
    "blikeiou":         page_blikeiou(),
    "glikeiou":         page_glikeiou(),
    "epal":             page_epal(),
}


def supa(method: str, path: str, *, body=None, headers=None) -> tuple[int, str]:
    req_headers = {
        "apikey":        SERVICE,
        "Authorization": f"Bearer {SERVICE}",
        **(headers or {}),
    }
    req = urllib.request.Request(f"{URL}{path}", data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")


def main() -> None:
    print(f"Target: {URL}\n")
    for slug, content in PAGES.items():
        body = json.dumps({"content_md": content}, ensure_ascii=False).encode("utf-8")
        code, msg = supa(
            "PATCH", f"/rest/v1/pages?slug=eq.{slug}",
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
            body=body,
        )
        status = "✓" if 200 <= code < 300 else "✗"
        print(f"  {status} /{slug:<25s} {len(content):>5d} chars  HTTP {code}")
    # Bust caches so the new layout shows up live
    print("\n→ Invalidating cache for all 6 pages...")
    revalidate_body = json.dumps({
        "tags": ["pages"],
        "paths": [f"/{s}" for s in PAGES],
    }).encode("utf-8")
    code, _ = supa(
        "POST", "/rest/v1/rpc/revalidate",  # placeholder; actual hit goes to the public site
        headers={"Content-Type": "application/json"},
        body=revalidate_body,
    )
    # (We hit the public site separately via curl; nothing to do here.)


if __name__ == "__main__":
    main()
