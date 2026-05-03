# Changelog

All notable changes to korifi-edu.gr are documented here, grouped by date.

---

## 2026-05-03

### Init
- Created GitHub repository `korifi-edu.gr`
- Established branching strategy: `main` = production-ready, feature work on `feature/<name>` branches
- Stack decision: Next.js 15 (App Router) + Supabase + Vercel

### Phase 1 — Foundation
- Next.js 15 + TypeScript + Tailwind scaffolding (`src/app`)
- Supabase clients (browser + server) under `src/lib/supabase/`
- TypeScript types for `subjects`, `courses`, `lessons`, `enrollments`, `profiles`
- `.env.local` with Supabase keys (gitignored)

### Phase 2.5 — Grade pages + backup pipeline

**Grade pages (Πρόγραμμα Σπουδών):**
- Scraped + imported 5 grade pages from live site as Markdown:
  - Γυμνάσιο (`/gimnasio`), Α' Λυκείου (`/alikeiou`), Β' Λυκείου (`/blikeiou`),
    Γ' Λυκείου & Πανελλήνιες (`/glikeiou`), ΕΠΑΛ (`/epal`)
- Dynamic `/[slug]` page route serves any published page (gimnasio, alikeiou, … synergates …)
- Markdown tables (κατάλογος μαθημάτων ανά τάξη) render via `remark-gfm`
- Navbar: "Πρόγραμμα Σπουδών" hover-dropdown με 5 links + "Συνεργάτες" link

**Team housekeeping:**
- ΜΑΝΔΑΝΗ ΑΝΑΣΤΑΣΙΑ removed (left the staff)
- ΠΑΠΑΤΡΙΑΝΤΑΦΥΛΛΟΥ ΔΗΜΗΤΡΗΣ photo set NULL (live site URL 404s — needs re-upload)

**Backup pipeline (`scripts/backup/`):**
- `backup.py` — dumps every public table as JSON + downloads every Storage bucket file
- Bundles to `_backups/korifi-edu-backup-YYYY-MM-DD.zip`, prunes local snapshots after 7 days
- `rclone.exe` (gitignored) ships separately; uploads zip to `gdrive:supabase backup/korifi-edu/`
- `install_scheduled_task.ps1` — registers Windows Task Scheduler entry for daily run at 03:00
- `SETUP.md` — one-time OAuth wizard instructions for Google Drive

### Phase 2.5 — Bug fixes + courses page
- Fix: `is_admin()` was unable to be executed by anon, which broke every
  "read published OR admin" RLS policy. PostgreSQL evaluates both sides of OR
  in a policy, so lack of EXECUTE turned every public read into 0 rows
  (manifesting as 404 on `/gia-emas`). Migration 0005 re-grants execute.
- Added `/courses` page with subject filter (Όλα / Γυμνάσιο / Α-Γ Λυκείου / ΕΠΑΛ),
  empty state messaging until LMS migration runs.

### Phase 2.5 — Content types + first real data
- New tables: `articles`, `pages`, `page_sections`, `teachers`, `events`, `testimonials`, `partners` — all with RLS (public-read-published / admin-write)
- `lessons` extended: `content_type` accepts `'article'` (Markdown), added `cover_image`
- Storage buckets `images` + `pdfs` (public read, admin write)
- Imported real content from existing korifi-edu.gr WordPress:
  - **17 teachers** with names, ειδικότητες, photos (URLs point to live site temporarily; will move to Supabase Storage in Phase 5)
  - **5 subjects**: Γυμνάσιο, Α΄/Β΄/Γ΄ Λυκείου, ΕΠΑΛ
  - **Pages**: "Για εμάς" with full philosophy markdown; placeholder shells for "Συνεργάτες" + "Επαγγελματικός Προσανατολισμός"
- New page `/gia-emas` rendering team grid + markdown
- Homepage shows preview of 8 teachers
- `next.config.ts`: remote image patterns for korifi-edu.gr + i0.wp.com + Supabase Storage
- Tailwind v4 typography plugin for prose markdown styling
- Scrape pipeline at `scripts/scrape/` (fetch_pages.py, extract_teachers.py, generate_teacher_insert.py)

### Phase 2.1–2.2 (partial) — Layout + Homepage
- Brand palette (indigo `brand-*` + amber `accent-*`) defined as CSS custom properties + Tailwind v4 `@theme inline` tokens
- Switched from Geist to Inter (Geist has no greek subset) + JetBrains Mono
- Greek `<html lang="el">`, metadata template στα ελληνικά
- `Navbar` + `Footer` shared layout components
- Homepage: hero + κατηγορίες μαθημάτων (από `subjects` table) + νέα μαθήματα (από `courses`), με σωστά empty states

### Phase 1.3 — Database schema
- `0001_initial_schema.sql` applied to Supabase: 5 tables, FK, indexes, RLS policies, `is_admin()` helper, auto-create profile trigger on signup
- `0002_restrict_definer_function_execute.sql`: revoked RPC execute on `handle_new_user`/`is_admin` from anon (kept `is_admin` for `authenticated` because RLS needs it)
- `supabase/README.md`: migration log + admin promotion query
- `.claude/` added to `.gitignore`
