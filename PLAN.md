# Πλάνο Ανάπτυξης — korifi-edu.gr

**Ημερομηνία έναρξης:** 2026-05-03  
**Stack:** Next.js 15 · Supabase · Vercel  
**Repo:** https://github.com/panoscoolman-beep/korifi-edu.gr

---

## Τι χτίζουμε

Ένα εκπαιδευτικό e-learning site για φροντιστήρια μέσης εκπαίδευσης. Αντικαθιστά το υπάρχον WordPress site (korifi-edu.gr) με custom, γρήγορο, εύκολα συντηρήσιμο σύστημα.

### Βασικές αρχές σχεδιασμού
- **Ταχύτητα πάνω από όλα** — στατικές σελίδες όπου είναι δυνατόν
- **Απλότητα** — ένα μόνο codebase, minimum εξαρτήσεις
- **Συντηρησιμότητα** — ο ίδιος ο ιδιοκτήτης μπορεί να προσθέτει περιεχόμενο χωρίς κώδικα

---

## Αρχιτεκτονική

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (deploy)                  │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │            Next.js 15 App Router            │  │
│   │                                             │  │
│   │  /                  → Αρχική σελίδα         │  │
│   │  /courses           → Λίστα μαθημάτων       │  │
│   │  /courses/[slug]    → Σελίδα μαθήματος      │  │
│   │  /lessons/[id]      → Viewer (PDF/κείμενο)  │  │
│   │  /login             → Σύνδεση               │  │
│   │  /register          → Εγγραφή               │  │
│   │  /dashboard         → Προφίλ μαθητή         │  │
│   │  /admin             → Admin panel           │  │
│   │                                             │  │
│   │  /api/*             → API routes (backend)  │  │
│   └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE                          │
│                                                     │
│  PostgreSQL DB      Auth          Storage           │
│  ─────────────      ────          ───────           │
│  courses            email/pass    /pdfs/            │
│  lessons            sessions      /images/          │
│  subjects                                           │
│  enrollments                                        │
│  users (profiles)                                   │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
subjects          -- Μαθήματα (Μαθηματικά, Φυσική, κλπ)
  id, name, slug, icon, order

courses           -- Κορμοί (π.χ. "Μαθηματικά Γ' Λυκείου")
  id, title, slug, description, subject_id,
  is_free, cover_image, created_at

lessons           -- Μαθήματα/ενότητες μέσα σε κάθε course
  id, title, course_id, order,
  content_type (pdf | text),
  pdf_url, content,
  is_free, created_at

enrollments       -- Ποιος έχει πρόσβαση σε ποιο course
  id, user_id, course_id, enrolled_at

profiles          -- Επιπλέον στοιχεία χρήστη (πέρα από Supabase Auth)
  id (= auth.users.id), full_name, role (student | admin)
```

---

## Σύστημα πρόσβασης (Access Control)

| Περιεχόμενο | Ανώνυμος | Εγγεγραμμένος |
|-------------|----------|---------------|
| Λίστα μαθημάτων | ✅ | ✅ |
| Preview μαθήματος (περιγραφή) | ✅ | ✅ |
| Free lessons | ✅ | ✅ |
| Premium lessons | ❌ | ✅ (αν έχει enrollment) |
| Admin panel | ❌ | ❌ (μόνο role=admin) |

---

## Φάσεις Ανάπτυξης

---

### ΦΑΣΗ 1 — Θεμέλια
**Branch:** `feature/phase-1-foundation`  
**Εκτιμώμενος χρόνος:** 3–5 ημέρες

#### 1.1 Accounts & Services
- [ ] Δημιουργία λογαριασμού Supabase
- [ ] Δημιουργία νέου Supabase project (`korifi-edu`)
- [ ] Δημιουργία λογαριασμού Vercel (login με GitHub)

#### 1.2 Next.js Project Setup
- [ ] `npx create-next-app@latest` με TypeScript + Tailwind CSS + App Router
- [ ] Εγκατάσταση Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Αρχείο `.env.local` με Supabase keys
- [ ] Βασική folder structure

#### 1.3 Database
- [ ] Δημιουργία tables στο Supabase (subjects, courses, lessons, enrollments, profiles)
- [ ] Row Level Security (RLS) policies — ποιος βλέπει τι
- [ ] Seed data — μερικά δοκιμαστικά μαθήματα

#### 1.4 Deploy
- [ ] Σύνδεση repo με Vercel (auto-deploy σε κάθε push στο main)
- [ ] Environment variables στο Vercel
- [ ] Test deploy

**Deliverable:** Το project τρέχει live σε `korifi-edu.vercel.app`

---

### ΦΑΣΗ 2 — Public Site (Μαθήματα)
**Branch:** `feature/phase-2-courses`  
**Εκτιμώμενος χρόνος:** 1–2 εβδομάδες

#### 2.1 Layout & Design
- [ ] Navbar (logo, navigation, login button)
- [ ] Footer
- [ ] Χρωματική παλέτα & typography (Tailwind config)

#### 2.2 Σελίδες μαθημάτων
- [ ] `/` — Αρχική: hero section, κατηγορίες μαθημάτων, featured courses
- [ ] `/courses` — Πλέγμα όλων των μαθημάτων με φίλτρο ανά subject
- [ ] `/courses/[slug]` — Σελίδα μαθήματος: περιγραφή, λίστα lessons, κουμπί εγγραφής

#### 2.3 Lesson Viewer
- [ ] `/lessons/[id]` — Viewer για PDF (embedded), κείμενο, και **article (Markdown)**
- [ ] Guard: αν το lesson είναι premium και ο χρήστης δεν έχει enrollment → redirect στο login
- [ ] Navigation (προηγούμενο / επόμενο lesson)

#### 2.4 Schema extension για άρθρα + media (NEW — από συζήτηση 2026-05-03)
- [ ] Migration `0003_lessons_article_support.sql`:
  - Επέκταση `lessons.content_type` με `'article'` (Markdown body αντί για plain text)
  - Πρόσθεση `lessons.cover_image text`
- [ ] Storage buckets: `images` (public), `pdfs` (private με signed URLs)
- [ ] Markdown rendering στο viewer (με image embed από Supabase Storage + YouTube embed για βίντεο)
- [ ] Στόχος Φάσης 4 admin: rich-text editor (TipTap ή παρόμοιο), drag-drop εικόνας → autoupload, paste YouTube link → autoembed

**Deliverable:** Κάποιος μπορεί να περιηγηθεί στα μαθήματα και να δει τα δωρεάν

---

### ΦΑΣΗ 3 — Authentication
**Branch:** `feature/phase-3-auth`  
**Εκτιμώμενος χρόνος:** 3–5 ημέρες

#### 3.1 Σελίδες
- [ ] `/login` — Form σύνδεσης (email + password)
- [ ] `/register` — Form εγγραφής (όνομα, email, password)
- [ ] `/forgot-password` — Reset password μέσω email

#### 3.2 Logic
- [ ] Supabase Auth integration (server-side με `@supabase/ssr`)
- [ ] Middleware για protected routes (`/dashboard`, `/lessons/[id]` για premium)
- [ ] Δημιουργία profile record αυτόματα μετά την εγγραφή

#### 3.3 Dashboard μαθητή
- [ ] `/dashboard` — Τα μαθήματα που έχει εγγραφεί, γρήγορη πρόσβαση

**Deliverable:** Πλήρες σύστημα login/register, protected content

---

### ΦΑΣΗ 4 — Admin Panel
**Branch:** `feature/phase-4-admin`  
**Εκτιμώμενος χρόνος:** 1–2 εβδομάδες

#### 4.1 Προστασία
- [ ] Route guard: μόνο χρήστες με `role=admin` έχουν πρόσβαση στο `/admin`

#### 4.2 Διαχείριση περιεχομένου
- [ ] `/admin` — Dashboard με στατιστικά (αριθμός μαθημάτων, χρηστών)
- [ ] `/admin/subjects` — CRUD για κατηγορίες μαθημάτων
- [ ] `/admin/courses` — CRUD για courses (τίτλος, κατηγορία, περιγραφή, εικόνα, free/premium)
- [ ] `/admin/courses/[id]/lessons` — CRUD για lessons (τίτλος, σειρά, PDF upload, free/premium)
- [ ] `/admin/users` — Λίστα χρηστών, αναθέτεις enrollment χειροκίνητα

#### 4.3 File Upload
- [ ] Upload PDF → αποθηκεύεται στο Supabase Storage `/pdfs/`
- [ ] Upload εικόνα εξωφύλλου → `/images/`
- [ ] Αυτόματη δημιουργία public URL μετά το upload

**Deliverable:** Μπορείς να προσθέσεις νέο μάθημα/PDF εντελώς χωρίς κώδικα

---

### ΦΑΣΗ 5 — Migration από WordPress
**Branch:** `feature/phase-5-migration`  
**Εκτιμώμενος χρόνος:** 3–5 ημέρες

#### 5.1 Ανάλυση δεδομένων
- [ ] Εξαγωγή courses/lessons από το WordPress MySQL dump (`itinacn_db1.sql`)
- [ ] Mapping: WordPress post types → νέο schema

#### 5.2 Migration script
- [ ] Python script που διαβάζει το SQL dump
- [ ] Εισάγει subjects, courses, lessons στο Supabase
- [ ] Ανεβάζει τα PDFs/εικόνες στο Supabase Storage

#### 5.3 Επαλήθευση
- [ ] Έλεγχος ότι όλα τα 98 courses μεταφέρθηκαν σωστά
- [ ] Έλεγχος ότι τα URLs των PDFs δουλεύουν

**Deliverable:** Όλο το παλιό περιεχόμενο είναι στο νέο σύστημα

---

### ΦΑΣΗ 6 — Launch
**Branch:** `feature/phase-6-launch`  
**Εκτιμώμενος χρόνος:** 2–3 ημέρες

#### 6.1 Domain
- [ ] Στο Vercel: προσθήκη custom domain `korifi-edu.gr`
- [ ] Στο Cretaforce: αλλαγή DNS (A record / CNAME) να δείχνει στο Vercel
- [ ] SSL certificate (αυτόματο από Vercel)

#### 6.2 Τελικοί έλεγχοι
- [ ] Performance test (Lighthouse score)
- [ ] Mobile responsiveness
- [ ] Έλεγχος όλων των protected routes
- [ ] 404 / error pages

#### 6.3 Παλιό site
- [ ] Ακύρωση Hostinger subscription
- [ ] Backup του WordPress DB και files σε τοπικό δίσκο

**Deliverable:** Το νέο site είναι live στο korifi-edu.gr

---

## Folder Structure (τελικό project)

```
korifi-edu.gr/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public routes (no auth needed)
│   │   ├── page.tsx            # Αρχική
│   │   ├── courses/
│   │   └── lessons/[id]/
│   ├── (auth)/                 # Auth routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/              # Protected: students
│   ├── admin/                  # Protected: admin only
│   └── api/                    # API routes
├── components/                 # Reusable UI components
│   ├── ui/                     # Buttons, inputs, cards κλπ
│   ├── layout/                 # Navbar, Footer
│   └── courses/                # CourseCard, LessonList κλπ
├── lib/
│   ├── supabase/               # Supabase client (server + browser)
│   └── utils.ts
├── types/                      # TypeScript types
├── .env.local                  # Keys (δεν ανεβαίνει στο GitHub)
├── CHANGELOG.md
├── PLAN.md
└── README.md
```

---

## Τεχνολογίες — Σύνοψη

| Τεχνολογία | Χρήση | Κόστος |
|------------|-------|--------|
| Next.js 15 | Frontend + API | Δωρεάν |
| Supabase | DB + Auth + Storage | Δωρεάν (έως 1GB storage) |
| Vercel | Deployment + CDN | Δωρεάν |
| Tailwind CSS | Styling | Δωρεάν |
| TypeScript | Type safety | Δωρεάν |
| Cretaforce | Domain name | Ήδη πληρωμένο |

**Μηνιαίο κόστος μετά το launch: ~€0** (έως ότου το traffic/storage αυξηθεί σημαντικά)

---

## Κανόνες Ανάπτυξης

1. **Κάθε feature → νέο branch** με όνομα `feature/<περιγραφή>`
2. **Κάθε αλλαγή → ενημέρωση CHANGELOG.md** με ημερομηνία
3. **Merge στο main μόνο** όταν το feature είναι ολοκληρωμένο και δοκιμασμένο
4. **Commit messages** στα αγγλικά, περιγραφικά (π.χ. `feat: add PDF viewer component`)
5. **Το `.env.local` ποτέ** δεν ανεβαίνει στο GitHub (είναι στο `.gitignore`)
