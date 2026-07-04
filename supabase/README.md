# Supabase setup

Project ID: `zasshnqnexnuzmplolnu` (region: `eu-west-1`, Postgres 17).

## Migrations

Τα migrations εφαρμόζονται μέσω Supabase MCP (apply_migration). Τα αρχεία στο `migrations/` είναι το source-of-truth — αν χρειαστεί να ξαναστηθεί η DB από την αρχή, τρέξε τα στη σειρά στον SQL Editor.

Η αρίθμηση `000N` ακολουθεί τη χρονολογική σειρά εφαρμογής (ίδια με τα
timestamp versions στο `supabase_migrations.schema_migrations`), οπότε ένα
rebuild = τρέξε 0001→0018 στη σειρά. Τα 0009–0015 προστέθηκαν αναδρομικά
(2026-07-04) — είχαν εφαρμοστεί απευθείας μέσω MCP και έλειπαν από το repo·
τα παλιά 0009–0011 μετανουμερώθηκαν σε 0016–0018 ώστε η σειρά να μείνει σωστή
(το 0016 split-admin εξαρτάται από το `course_access_codes` του 0009).

| # | Αρχείο | Τι κάνει |
|---|--------|----------|
| 0001 | `initial_schema.sql` | 5 tables, FK, indexes, RLS, `is_admin()`, `handle_new_user()` trigger |
| 0002 | `restrict_definer_function_execute.sql` | Revoke RPC execute σε SECURITY DEFINER functions |
| 0003 | `content_types.sql` | Content type tables |
| 0004 | `lessons_article_support_and_storage_buckets.sql` | Lessons/articles + `images`/`pdfs` buckets |
| 0005 | `grant_is_admin_execute_to_anon.sql` | Grant `is_admin()` execute (για RLS reads) |
| 0006 | `add_teacher_role.sql` | Teacher role |
| 0007 | `gallery_albums_and_photos.sql` | Gallery tables |
| 0008 | `courses_icon.sql` | Course icon column |
| 0009 | `course_access_codes.sql` | Code-based enrollment + `redeem_course_access_code()` RPC |
| 0010 | `testimonials_source_ref.sql` | `testimonials.source_ref` (sync idempotency) |
| 0011 | `testimonials_full_quote.sql` | `testimonials.full_quote` (popup body) |
| 0012 | `tighten_security_definer_grants.sql` | Revoke RPC execute (⚠️ μερικώς reverted από 0014) |
| 0013 | `tighten_storage_bucket_listing.sql` | Drop bucket-LIST policies (direct URL reads μένουν) |
| 0014 | `restore_is_admin_execute_for_rls.sql` | Re-grant `is_admin()`/`is_teacher_or_admin()` execute |
| 0015 | `anon_list_public_media_for_backup.sql` | Anon LIST των public buckets (για offsite backup) |
| 0016 | `split_admin_all_policies_to_iud.sql` | Admin `FOR ALL` → INSERT/UPDATE/DELETE (perf advisor) |
| 0017 | `wrap_auth_calls_in_select_rls_initplan.sql` | `auth.*()` σε `(select …)` (perf advisor) |
| 0018 | `merge_profiles_update_policies.sql` | Merge profiles UPDATE policies (role-escalation guard) |

## Πώς γίνεσαι admin

Μετά την πρώτη σου εγγραφή στο site (`/register`), τρέξε στο SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'panoscoolman@gmail.com');
```

## RLS — γρήγορη επεξήγηση

| Table       | Public read | Auth user                 | Admin        |
|-------------|-------------|---------------------------|--------------|
| subjects    | ✅ όλα      | ✅                         | ✅ + write    |
| courses     | ✅ όλα      | ✅                         | ✅ + write    |
| lessons     | ✅ free μόνο| ✅ free + enrolled premium | ✅ + write    |
| profiles    | ❌          | ✅ μόνο το δικό του        | ✅ όλα + write|
| enrollments | ❌          | ✅ μόνο τα δικά του        | ✅ + write    |

## Storage buckets (για Φάση 4)

Ακόμα δεν τα χρειαζόμαστε. Όταν φτάσουμε στο admin upload θα δημιουργήσουμε:
- `pdfs`   (private, signed URLs)
- `images` (public, για cover images)
