-- Revert the over-tight grant revocation from migration tighten_security_definer_grants.
-- RLS policies on the public tables (pages, articles, teachers, events,
-- testimonials, partners, courses, lessons, gallery_*) call is_admin() inside
-- their USING expressions. When EXECUTE is revoked from anon/authenticated,
-- the policy expression errors out and PostgREST returns 401 for ALL reads,
-- breaking the public site.
--
-- is_admin() returns false for any caller without a valid auth.uid() and the
-- caller's actual admin status otherwise. It does NOT leak data, so calling
-- it from anon/authenticated is safe — the Supabase advisor was overly cautious.

grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;

grant execute on function public.is_teacher_or_admin() to anon;
grant execute on function public.is_teacher_or_admin() to authenticated;

-- rls_auto_enable() stays revoked — it's a setup utility, never called from RLS policies.
