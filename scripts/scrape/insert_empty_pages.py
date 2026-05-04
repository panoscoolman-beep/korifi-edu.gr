"""Populate the 3 previously-empty pages: /epikoinonia, /epaggelmatikos-prosanatolismos, /online-mathimata.

Idempotent — uses upsert on `slug`. Run:
    python scripts/scrape/insert_empty_pages.py
"""
from __future__ import annotations
import sys, json, urllib.request, urllib.parse
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2]

def load_env(p: Path) -> dict:
    env = {}
    for ln in p.read_text(encoding="utf-8").splitlines():
        ln = ln.strip()
        if not ln or ln.startswith("#") or "=" not in ln:
            continue
        k, _, v = ln.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

env = load_env(ROOT / ".env.local")
URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]

CID = "FD7C31D3-576C-4DD7-8896-6FC03492112D"

PAGES = [
    {
        "slug": "epikoinonia",
        "title": "Επικοινωνία",
        "meta_description": "Στοιχεία επικοινωνίας του Φροντιστηρίου Κορυφή στην Καλλονή Λέσβου — τηλέφωνο, email, διεύθυνση και social media.",
        "content_md": """## Φροντιστήριο Κορυφή — Καλλονή Λέσβου

Είμαστε εδώ για να απαντήσουμε σε κάθε σας ερώτηση — για εγγραφές, μαθήματα, πρόγραμμα σπουδών ή οποιαδήποτε πληροφορία αφορά τις σπουδές των παιδιών σας.

### Στοιχεία επικοινωνίας

- **Διεύθυνση:** Καλλονή Λέσβου, ΤΚ 81107
- **Τηλέφωνο:** [22530 25080](tel:+302253025080)
- **Email:** [frontistiriokorifh@gmail.com](mailto:frontistiriokorifh@gmail.com)

### Πού θα μας βρείτε

Στο [Google Maps](https://maps.app.goo.gl/G3P3Bc8ync7s9arc8) — στο κέντρο της Καλλονής, εύκολα προσβάσιμοι από όλη τη Δυτική Λέσβο.

### Ακολούθησέ μας

- [Instagram — @frontistiriakorifh](https://www.instagram.com/frontistiriakorifh/)
- [Facebook — Φροντιστήριο Κορυφή](https://www.facebook.com/frontistiriokorifh)

### Ωράριο γραμματείας

Σας εξυπηρετούμε καθημερινά κατά τις ώρες λειτουργίας του φροντιστηρίου. Για ραντεβού ή ενημέρωση εκτός ωραρίου, στείλτε μας email ή μήνυμα στα social και θα σας απαντήσουμε το συντομότερο.
""",
        "is_published": True,
    },
    {
        "slug": "epaggelmatikos-prosanatolismos",
        "title": "Επαγγελματικός Προσανατολισμός",
        "meta_description": "Your Career Plan — Πρόγραμμα Συμβουλευτικής Σταδιοδρομίας 4 συνεδριών σε συνεργασία με την Your Career. Αυτογνωσία, ψυχομετρικά εργαλεία και έγκυρη πληροφόρηση για ώριμες επιλογές σπουδών.",
        "content_md": """<div class="not-prose mb-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg sm:p-10">
  <p class="text-sm font-semibold uppercase tracking-wider text-amber-300">Σε συνεργασία με την Your Career</p>
  <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your Career Plan</h2>
  <p class="mt-2 text-lg text-brand-100">Πρόγραμμα Συμβουλευτικής Σταδιοδρομίας — 4 συνεδρίες</p>
</div>

Η επιλογή σπουδών είναι μία από τις πιο σημαντικές αποφάσεις που καλείται να πάρει ένας έφηβος. Σε αυτή την ηλικία είναι απολύτως φυσιολογικό να υπάρχει σύγχυση, ανασφάλεια ή και πίεση. **Στόχος μας δεν είναι να «βρούμε ένα επάγγελμα»**, αλλά να βοηθήσουμε τον μαθητή να αποκτήσει **αυτογνωσία, κριτήρια και σωστή πληροφόρηση**, ώστε να κάνει μια ώριμη και τεκμηριωμένη επιλογή σπουδών.

Στα **Φροντιστήρια Μέσης Εκπαίδευσης Κορυφή** συνεργαζόμαστε με τους ειδικούς της [**Your Career**](http://yourcareer.gr), σε ένα δομημένο πρόγραμμα **4 συνεδριών** που συνδυάζει ψυχομετρικά εργαλεία, ασκήσεις αυτογνωσίας και έγκυρη πληροφόρηση για σχολές και επαγγελματικές προοπτικές.

## Οι 4 συνεδρίες του προγράμματος

<div class="not-prose mt-6 grid gap-5 sm:grid-cols-2">

<div class="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
  <div class="flex items-center gap-3">
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">1</span>
    <h3 class="text-lg font-bold text-slate-900">Διερεύνηση &amp; Στόχοι</h3>
  </div>
  <p class="mt-2 text-sm font-medium text-brand-700">Συνεδρία με τον μαθητή</p>
  <p class="mt-3 text-sm text-slate-600">Δημιουργούμε πλαίσιο εμπιστοσύνης, χαρτογραφούμε την παρούσα κατάσταση και ορίζουμε ξεκάθαρο στόχο για τη συνέχεια.</p>
  <ul class="mt-3 space-y-1 text-sm text-slate-700">
    <li>· Στοχευμένη συμβουλευτική συνέντευξη</li>
    <li>· Πρώτη αποτύπωση ενδιαφερόντων &amp; μοτίβων</li>
    <li>· Διερεύνηση πηγών άγχους (σχολείο, οικογένεια, χρόνος)</li>
  </ul>
</div>

<div class="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
  <div class="flex items-center gap-3">
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">2</span>
    <h3 class="text-lg font-bold text-slate-900">Αυτογνωσία &amp; Εργαλεία</h3>
  </div>
  <p class="mt-2 text-sm font-medium text-brand-700">Συνεδρία με τον μαθητή</p>
  <p class="mt-3 text-sm text-slate-600">Η βάση της αυτογνωσίας — αποτυπώνουμε ενδιαφέροντα και αξίες με δομημένα ψυχομετρικά εργαλεία.</p>
  <ul class="mt-3 space-y-1 text-sm text-slate-700">
    <li>· Ερωτηματολόγιο Ενδιαφερόντων «Αριάδνη»</li>
    <li>· Διερεύνηση Εργασιακών Αξιών</li>
    <li>· Αναγνώριση περιοριστικών πεποιθήσεων</li>
    <li>· SWOT Ανάλυση προσαρμοσμένη στον μαθητή</li>
  </ul>
</div>

<div class="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
  <div class="flex items-center gap-3">
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">3</span>
    <h3 class="text-lg font-bold text-slate-900">Σχολές &amp; Προοπτικές</h3>
  </div>
  <p class="mt-2 text-sm font-medium text-brand-700">Συνεδρία με τον μαθητή</p>
  <p class="mt-3 text-sm text-slate-600">Συνδέουμε την αυτογνωσία με την πραγματικότητα — σχολές, προγράμματα σπουδών, επαγγελματικά δικαιώματα.</p>
  <ul class="mt-3 space-y-1 text-sm text-slate-700">
    <li>· Οδηγός Σταδιοδρομίας — η πληρέστερη πλατφόρμα πληροφόρησης</li>
    <li>· Συγκριτική ανάλυση σχολών (ουσία, όχι μόνο τίτλος)</li>
    <li>· Υλικό από το YouTube κανάλι μας με συνεντεύξεις επαγγελματιών</li>
  </ul>
</div>

<div class="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
  <div class="flex items-center gap-3">
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-slate-900">4</span>
    <h3 class="text-lg font-bold text-slate-900">Κοινή Συνεδρία με Γονείς</h3>
  </div>
  <p class="mt-2 text-sm font-medium text-amber-700">Μαθητής &amp; γονείς μαζί</p>
  <p class="mt-3 text-sm text-slate-700">Η πιο κομβική συνεδρία — συνδέει την απόφαση του μαθητή με το οικογενειακό περιβάλλον.</p>
  <ul class="mt-3 space-y-1 text-sm text-slate-700">
    <li>· Παρουσίαση συμπερασμάτων με σαφήνεια</li>
    <li>· Απάντηση αποριών &amp; προβληματισμών των γονέων</li>
    <li>· Πλαίσιο στήριξης χωρίς πίεση</li>
    <li>· Οριστικοποίηση επόμενων βημάτων</li>
  </ul>
</div>

</div>

## Τι κερδίζει ο μαθητής

Με την ολοκλήρωση των 4 συνεδριών, ο μαθητής:

- αποκτά **ολοκληρωμένη εικόνα για τον εαυτό του** — ενδιαφέροντα, αξίες, δυνατότητες
- μαθαίνει να **παίρνει αποφάσεις με κριτήρια**, όχι με φόβο
- ενημερώνεται **υπεύθυνα** για σχολές, προοπτικές και επαγγελματικές διαδρομές
- καταλήγει σε **στοχευμένες επιλογές** σπουδών
- νιώθει **μεγαλύτερη σιγουριά και ηρεμία** απέναντι στο μέλλον

> **Για τους μαθητές μας** ισχύουν ειδικές τιμές για το πρόγραμμα, καθώς και για τη συμπλήρωση του Μηχανογραφικού Δελτίου.

<div class="not-prose mt-12 rounded-2xl bg-gradient-to-r from-brand-50 via-amber-50 to-brand-50 p-8 text-center">
  <p class="text-lg font-medium text-slate-700">Έτοιμοι να ξεκινήσετε;</p>
  <p class="mt-1 text-sm text-slate-600">Μάθετε περισσότερα στη σελίδα της Your Career ή επικοινωνήστε μαζί μας.</p>
  <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
    <a
      href="http://yourcareer.gr"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-full bg-amber-300 px-8 py-4 text-base font-semibold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg"
    >
      Πατήστε εδώ
      <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 2h5v5M14 2L7 9" stroke-linecap="round"/>
      </svg>
    </a>
    <a
      href="/epikoinonia"
      class="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-4 text-base font-semibold text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
    >
      Επικοινωνία με το φροντιστήριο
    </a>
  </div>
</div>
""",
        "is_published": True,
    },
    {
        "slug": "online-mathimata",
        "title": "Online Μαθήματα",
        "meta_description": "Εξ αποστάσεως μαθήματα στο Φροντιστήριο Κορυφή — ευελιξία, σύγχρονες πλατφόρμες, ίδια ποιότητα με τη δια ζώσης διδασκαλία.",
        "content_md": """## Μαθαίνεις από οπουδήποτε — με την ίδια ποιότητα

Στο **Κορυφή** προσφέρουμε εξ αποστάσεως μαθήματα για μαθητές που, για οποιονδήποτε λόγο, δεν μπορούν να παρακολουθήσουν δια ζώσης. Είτε μένετε σε άλλο χωριό της Λέσβου, είτε σε άλλη πόλη, είτε αντιμετωπίζετε έκτακτο πρόβλημα — η μάθηση δεν σταματά.

### Πώς λειτουργεί

- **Σύγχρονη διδασκαλία:** Live μαθήματα μέσω επαγγελματικής πλατφόρμας τηλεδιάσκεψης. Ο καθηγητής βλέπει και αλληλεπιδρά με τον μαθητή σε πραγματικό χρόνο, όπως στην τάξη.
- **Διαμοιρασμός υλικού:** Σημειώσεις, ασκήσεις και θέματα πανελλαδικών αποστέλλονται ψηφιακά πριν και μετά το μάθημα.
- **Ευέλικτο πρόγραμμα:** Επιλέγουμε μαζί ώρες που ταιριάζουν στις υποχρεώσεις σας — απογεύματα, βράδια ή Σαββατοκύριακα.
- **Παρακολούθηση προόδου:** Τακτικά διαγωνίσματα και ενημέρωση γονέων, όπως ακριβώς και στα δια ζώσης τμήματα.

### Για ποιους ταιριάζει

- Μαθητές Γυμνασίου, Λυκείου και ΕΠΑΛ
- Υποψήφιους Πανελληνίων που χρειάζονται **εντατική, στοχευμένη** προετοιμασία
- Μαθητές που μένουν εκτός Καλλονής αλλά θέλουν την ποιότητα της **Κορυφής**
- Όσους χάνουν μαθήματα λόγω ασθένειας ή υποχρεώσεων και θέλουν να μην μείνουν πίσω

### Τι θα χρειαστείτε

- Σταθερή σύνδεση internet
- Υπολογιστή ή tablet με κάμερα και μικρόφωνο
- Έναν ήσυχο χώρο μελέτης

---

### Ενδιαφέρεστε;

Επικοινωνήστε μαζί μας για να σχεδιάσουμε μαζί το πρόγραμμά σας — να συζητήσουμε ποια μαθήματα χρειάζεστε, πόσες ώρες την εβδομάδα και ποιο πρόγραμμα ταιριάζει.

📞 [22530 25080](tel:+302253025080) · ✉️ [frontistiriokorifh@gmail.com](mailto:frontistiriokorifh@gmail.com) · 📍 [Πληροφορίες & επικοινωνία](/epikoinonia)
""",
        "is_published": True,
    },
]


def supa_request(method: str, path: str, *, headers=None, body=None, params=None):
    url = f"{URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req_headers = {
        "apikey": SERVICE,
        "Authorization": f"Bearer {SERVICE}",
        **(headers or {}),
    }
    req = urllib.request.Request(url, data=body, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def upsert_pages():
    headers = {
        "Content-Type": "application/json",
        "Prefer": "return=minimal,resolution=merge-duplicates",
    }
    body = json.dumps(PAGES, ensure_ascii=False).encode("utf-8")
    code, resp = supa_request(
        "POST", "/rest/v1/pages", headers=headers, body=body, params={"on_conflict": "slug"}
    )
    if 200 <= code < 300:
        print(f"✓ Upserted {len(PAGES)} pages (HTTP {code})")
        for p in PAGES:
            print(f"    - /{p['slug']:<35s} {len(p['content_md'])} chars")
    else:
        print(f"✗ HTTP {code}: {resp[:300].decode('utf-8', errors='replace')}")
        sys.exit(1)


if __name__ == "__main__":
    print(f"Target: {URL}\n")
    upsert_pages()
    print("\nDone.")
