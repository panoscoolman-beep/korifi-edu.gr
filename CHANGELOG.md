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
