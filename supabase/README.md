# Supabase setup

Project ID: `zasshnqnexnuzmplolnu` (region: `eu-west-1`, Postgres 17).

## Migrations

Τα migrations εφαρμόζονται μέσω Supabase MCP (apply_migration). Τα αρχεία στο `migrations/` είναι το source-of-truth — αν χρειαστεί να ξαναστηθεί η DB από την αρχή, τρέξε τα στη σειρά στον SQL Editor.

| # | Αρχείο | Τι κάνει |
|---|--------|----------|
| 0001 | `initial_schema.sql` | 5 tables, FK, indexes, RLS, `is_admin()`, `handle_new_user()` trigger |
| 0002 | `restrict_definer_function_execute.sql` | Revoke RPC execute σε SECURITY DEFINER functions |

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
