# Changelog

Chronological log όλων των αλλαγών — διαβάζεται από το πιο πρόσφατο προς το πιο παλιό. Σκοπός: γρήγορο catchup σε κάθε νέα συνομιλία ή συνεργάτη.

> **Where we are now (latest):** Site σχεδόν launch-ready τοπικά. Όλα τα core features δουλεύουν: public catalog (pages/blog/events/gallery/courses/lessons/teachers), full admin CRUD, auth (email + Google), 16/17 photos σε Storage, dark themed header + footer with real socials/Maps, 35 articles + 5 LMS courses migrated. Επόμενα μεγάλα steps: συμπλήρωση κενών pages content + Vercel deployment.

---

## 2026-05-04 (evening — visual polish + content migration)

### 🎨 Branding + visual polish
- **Logo**: το original (μαύρο "ΚΟΡΥΦΗ" wordmark με κόκκινη κορυφή στο "Υ", `/public/logo.png`) είναι default. Καλοκαιρινή ανανάς version σε `/public/logo-summer.png` standby.
- **Dark themed header** (`#1f3a5f` matching footer): inverted-white logo + amber-300 hover/CTA → συμμετρικό με footer.
- **Footer mirrors live korifi-edu.gr**: 3 columns (Επικοινωνία / Κορυφή tagline / Social), real contact info (tel:+302253025080, mailto:frontistiriokorifh@gmail.com), Instagram + Facebook + Maps icons. Maps points σε `https://maps.app.goo.gl/G3P3Bc8ync7s9arc8` (owner-provided).
- **ResourcesStrip** πάνω από footer: 4 cards με τα **σωστά original images** από κορυφή-edu.gr (compass, exams, calculator, newspaper) που linkάρουν εξωτερικά στο Stadiodromia.gr platform με τον CID `FD7C31D3-576C-4DD7-8896-6FC03492112D`.

### 📦 Content migration via service_role
- **35 articles** upserted στο `articles` (HTML→Markdown, cover images, authors)
- **16/17 teacher photos** ανέβηκαν σε Supabase Storage (`images/teachers/`) και η DB updated σε public URLs
- **3 course covers** ανέβηκαν σε Storage
- **6 teacher bios** scraped από grade pages και inserted στο `teachers.bio_md`
- Service role key στο `.env.local` (gitignored). Owner can rotate anytime.

### 👥 Teacher bio popups
- **TeacherGrid** client component: click teacher card → modal with full Markdown bio + email
- Esc + click-outside to close, body scroll locked
- /gia-emas page αναβαθμισμένο

### 📷 Photo gallery (NEW feature)
- Schema (migration 0007): `gallery_albums` + `gallery_photos` με RLS
- Admin: /admin/gallery list + form για άλμπουμ + **PhotoManager** (drag-drop multi-upload με per-file progress, hover delete)
- Public: /gallery (album cards με photo count + date) + /gallery/[slug] (grid → fullscreen Lightbox με prev/next/Esc/arrow-keys)
- Navbar entry "Φωτογραφίες"

### 🔧 LMS public routes (από νωρίτερα την ίδια μέρα)
- 5 courses + 21 lessons inserted (ASCII slugs για Next.js compatibility)
- Public `/courses/[slug]` + `/lessons/[id]` με PDF iframe viewer + premium gate

### 🔐 Memory updates
- New feedback rule: **auto-save στο stop** (CHANGELOG + push χωρίς να ζητάει permission)
- New feedback rule: **CHANGELOG.md = project memory** — διαβάζεται πρώτο σε κάθε νέα συνομιλία
- New feedback rule: **end-to-end verification πριν "done"**
- New project note: **team roster changes** (Μανδάνη left, Παπατριανταφύλλου photo broken)

### 🐛 Γνωστά εκκρεμή
- ΠΑΠΑΤΡΙΑΝΤΑΦΥΛΛΟΥ ΔΗΜΗΤΡΗΣ: photo_url = NULL, χρειάζεται upload
- Empty pages content: /online-mathimata, /epikoinonia, /epaggelmatikos-prosanatolismos
- Articles content_md έχει links σε `https://yourcareer.gr/...` και `https://korifi-edu.gr/wp-content/uploads/...` που θα ζήσουν όσο ζει το παλιό hosting

---

## 2026-05-04 (continued — public routes)

### 🌍 Public routes για νέους content types
- `/blog` (list) + `/blog/[slug]` (article detail) με Markdown rendering, cover images
- `/events` (list, χωρισμένο σε Επερχόμενες/Παρελθούσες) + `/events/[slug]` (detail με datetime, location, link)
- `/synergates` (custom page) — overrides το generic `/[slug]` και προσθέτει grid με partners από DB
- Homepage: νέα sections `Τι λένε για εμάς` (testimonials) + `Από το blog` (latest 3 articles)
- Navbar: προστέθηκαν Blog + Εκδηλώσεις
- `[slug]` route: ενημερωμένη RESERVED list (blog, events, synergates τώρα έχουν δικά τους routes)

**Verification:** όλες οι public routes 200 με σωστό content. Empty states cleanly shown όπου δεν υπάρχει data ακόμα.

---

## 2026-05-04 (later)

### 🛠 Φάση 4 — Admin panel (`feature/phase-4-admin`)

**Στόχος:** Self-sufficiency. Χωρίς admin = κάθε edit χρειάζεται SQL ή κώδικα. Με admin = ό,τι θες από browser.

**Decisions:**
- Markdown body παραμένει source of truth (`content_md`). Editor: textarea + toolbar + live preview + drag-drop εικόνας. Όχι TipTap (overkill).
- Generic CRUD action `saveResource(table, id?, prev, fd)` που χρησιμοποιείται από ΟΛΑ τα forms (DRY).
- Υπάρχει role gate και στο layout και στο proxy (defense in depth).
- Image upload → `/api/admin/upload-image` → Supabase Storage `images` bucket → public URL επιστρέφεται.
- PDF upload → `/api/admin/upload-pdf` → `pdfs` bucket → public URL.

**New routes (όλα admin-only μέσω `/admin/layout.tsx` role gate):**
- `/admin` — dashboard με stats per content type + quick actions
- `/admin/pages` (list/new/edit) — με `MarkdownEditor`
- `/admin/articles` (list/new/edit) — blog με `MarkdownEditor` + cover image
- `/admin/teachers` (list/new/edit) — bio_md + photo upload
- `/admin/events` (list/new/edit) — datetime fields + cover
- `/admin/testimonials` (list/new/edit)
- `/admin/partners` (list/new/edit) — logo upload
- `/admin/subjects` (list/new/edit)
- `/admin/courses` (list/new/edit) — με dropdown για subject
- `/admin/lessons` (list/new/edit) — type=pdf|article|text + dropdown για course + PDF upload
- `/admin/users` — list όλων + inline `<select>` για αλλαγή role
- `/admin/storage` — read-only browser όλων των αρχείων

**New API routes:**
- `POST /api/admin/upload-image` — multipart upload, max 8MB, JPEG/PNG/WebP/GIF/SVG
- `POST /api/admin/upload-pdf`   — multipart upload, max 50MB, application/pdf
- `POST /api/admin/preview-markdown` — server-side rendering για preview tab του editor

**New components:**
- `<Field>`, `<TextArea>`, `<Toggle>`, `<Select>`, `<FormError>` — admin/Field.tsx
- `<ImageUpload>` — drag-drop, paste, click-to-pick → `/api/admin/upload-image`
- `<PdfUpload>` — ίδιο για PDFs
- `<MarkdownEditor>` — textarea + toolbar (H1-H3, bold, italic, list, quote, link, image) + tabs Γραφή / Προεπισκόπηση
- `<AdminTable>`, `<AdminListHeader>`, `<PublishedBadge>` — reusable list patterns

**Proxy unchanged** — `/admin` redirect logic ήδη in place από Φάση 3.

**Verification:** All 14 admin routes return 307 για anonymous (correct — proxy redirects σε `/login`). Type-check clean. Real auth flow τέσταρμένο στο /dashboard ήδη — admin layout χρησιμοποιεί ίδιο pattern.

**⏭ User actions to test (ως admin `panoscoolman@gmail.com`):**
1. Login → πάνω δεξιά → "Διαχείριση"
2. **Πιο σημαντικό test:** /admin/teachers → click Παπατριανταφύλλου → upload σωστή φωτογραφία → Save → δες το /gia-emas
3. Δοκίμασε νέο άρθρο, νέα σελίδα, αλλαγή role σε χρήστη
4. Bug reports → next iteration

---

## 2026-05-04

### 🔐 Φάση 3 — Authentication scaffolded (`feature/phase-3-auth`)

**Decisions:**
- Email + password + **Google OAuth** support
- **Email verification υποχρεωτικό** στο signup
- 3 roles: `student` (default), `teacher` (μπορεί να αυθορίζει courses/lessons/articles), `admin` (full)

**Migration 0006 — `add_teacher_role`:**
- `profiles.role` enum extended με `'teacher'`
- New helper `is_teacher_or_admin()`
- `profiles update own` policy harden: user can edit `full_name` αλλά **όχι** το `role` του (no self-promotion)

**Server actions** (`src/app/(auth)/actions.ts`):
- `signInWithPassword`, `signUpWithPassword`, `signInWithGoogle`, `sendPasswordReset`, `signOut`
- Validation στα ελληνικά error messages

**Pages:**
- `/login` (`(auth)/login/page.tsx` + client `LoginForm`) — email/password + Google button
- `/register` με email verification flow
- `/forgot-password` — reset email
- `/dashboard` — student view με enrollments + admin link αν `role=admin`
- `/auth/callback` route handler για Google OAuth + email verification redirect

**Proxy** (`src/proxy.ts` — Next 16 renamed `middleware` → `proxy`):
- Auto-refresh Supabase session cookies σε κάθε request
- `/dashboard`, `/admin/*` redirect στο `/login?next=...` αν δεν είναι authenticated
- `/admin/*` extra check: redirect στο `/dashboard` αν `role≠admin`
- `/login`, `/register` redirect στο `/dashboard` αν ήδη logged in

**Navbar:**
- Logged-out: "Σύνδεση" button
- Logged-in: dropdown με email + "Ο λογαριασμός μου" + "Διαχείριση" (αν admin) + "Αποσύνδεση"

**Verification:** όλα 9 routes (incl. προστατευμένα) return σωστό status. Type-check clean.

**✅ Verified end-to-end (2026-05-04 evening):**
- Google Cloud OAuth credentials configured (Client ID `512604453780-...`)
- Supabase Google provider enabled, email confirmations on
- `panoscoolman@gmail.com` signed in via Google → profile auto-created
- SQL promotion to `role='admin'` applied → user can see Admin link in navbar
- Email signup + verification flow tested separately, works

### 💾 Backup pipeline — LIVE
- `scripts/backup/backup.py` τρέχει κάθε μέρα στις 03:00 (Windows Task Scheduler)
- Upload σε Google Drive → `supabase backup/korifi-edu/korifi-edu-backup-YYYY-MM-DD.zip`
- rclone OAuth setup ολοκληρώθηκε. Verified end-to-end (manual trigger → exit 0 → νέο zip στο Drive).
- Local snapshots διατηρούνται 7 μέρες, στο Drive τίποτα δεν διαγράφεται.

### 🏫 Φάση 2.5 — Grade pages + content types — MERGED στο `main`
- **Νέοι πίνακες** (migration 0003): `articles`, `pages`, `page_sections`, `teachers`, `events`, `testimonials`, `partners` με RLS policies (public read for published, admin write).
- **Storage buckets** (migration 0004): `images`, `pdfs` (public read, admin write).
- **Lessons extension** (0004): `content_type` πια accepts `'article'` (Markdown body) + νέο `cover_image` column.
- **RLS bug fix** (0005): re-grant `is_admin()` execute σε anon — διαφορετικά κάθε `select` σε pages/teachers επέστρεφε 0 rows λόγω OR evaluation.

### 📦 Real data imported από korifi-edu.gr
- **17 καθηγητές** με ονόματα, ειδικότητες, φωτό (URLs τοπικά στο live site — Φάση 5 θα τα μεταφέρει σε Supabase Storage)
- **5 grade pages** scraped + converted to Markdown: `/gimnasio`, `/alikeiou`, `/blikeiou`, `/glikeiou`, `/epal`
- **Page "Για εμάς"** με philosophy markdown
- 2 placeholder pages: `/synergates`, `/epaggelmatikos-prosanatolismos` (κενές στο live)
- 5 subjects (Γυμνάσιο, Α/Β/Γ Λυκείου, ΕΠΑΛ)

### 🎨 Frontend
- Dynamic `/[slug]` route serves οποιαδήποτε published page
- Markdown tables (κατάλογος μαθημάτων) render με `remark-gfm`
- Navbar dropdown "Πρόγραμμα Σπουδών" → 5 grade pages
- Homepage: hero + κατηγορίες + 8 καθηγητές preview
- `/courses` listing με filter chips (LMS data έρχεται στο μέλλον)
- Verified: όλα 10+ routes return 200 με σωστό ελληνικό content

### 🐛 Πράγματα που χρειάζονται ακόμα
- ΠΑΠΑΤΡΙΑΝΤΑΦΥΛΛΟΥ ΔΗΜΗΤΡΗΣ photo: το URL στο live (`/wp-content/uploads/2026/05/1000039612.jpg`) επιστρέφει 404 — owner χρειάζεται να ξανανεβάσει
- LMS courses + lessons + 419 PDFs όχι ακόμα migrated (έχω ήδη τα data στο `scripts/scrape/lms_sample.json`)
- 27 blog articles από SQL dump όχι ακόμα migrated
- Pages `/online-mathimata`, `/epikoinonia`, `/epaggelmatikos-prosanatolismos` δεν έχουν content (κενές στο live ή χρειάζονται user input)

---

## 2026-05-03 (νωρίτερα την ίδια μέρα)

### 🚀 Φάση 1 — Foundation
- Created GitHub repo `korifi-edu.gr` (https://github.com/panoscoolman-beep/korifi-edu.gr)
- Branching strategy: `main` = production, `feature/<name>` per feature
- Stack: Next.js 16.2.4 + React 19.2.4 + Tailwind v4 + Supabase + Vercel
- Supabase project `zasshnqnexnuzmplolnu` (eu-west-1, Postgres 17)
- `.env.local` με Supabase keys (gitignored)

### 🗄️ Φάση 1.3 — Database schema (migration 0001 + 0002)
- 5 base tables: `subjects`, `courses`, `lessons`, `enrollments`, `profiles`
- RLS policies, `is_admin()` helper, `handle_new_user()` trigger για auto-create profile
- Locked down SECURITY DEFINER functions από anon (later partially reversed στο 0005)

### 🎨 Φάση 2.1–2.2 — Brand + Layout + Homepage
- Brand colors (indigo `brand-*` + amber `accent-*`) via Tailwind v4 `@theme inline`
- Inter (greek subset) + JetBrains Mono fonts
- Greek `<html lang="el">` + Greek metadata
- Shared Navbar + Footer
- Homepage scaffold

---

## Conventions για future entries

- Κάθε commit → νέα γραμμή ή subsection στο entry της σημερινής μέρας
- Κάθε φάση → καθαρό subsection (`### Φάση N — όνομα`)
- Φύλαξε τις **decisions** (τι επιλέξαμε και γιατί) ώστε να μην ξανασυζητάμε
- Στο τέλος κάθε section → ✅ τα completed, 🐛 τα γνωστά bugs, ⏭ τα επόμενα
- Νέες μέρες πάνω, παλιές κάτω
