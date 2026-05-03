-- is_admin() is invoked by RLS policies (e.g. "or public.is_admin()") and must
-- be executable by anon as well as authenticated. The function is SECURITY
-- DEFINER and only checks if the CURRENT user has role='admin' — for anon it
-- returns false, leaking nothing.
--
-- This walks back the over-eager revoke from migration 0002, which left every
-- "read published or admin" RLS policy unable to evaluate for anonymous users
-- (PostgreSQL evaluates both sides of the OR; lacking EXECUTE on is_admin made
-- the whole policy error → query returned 0 rows → app rendered 404).
grant execute on function public.is_admin() to anon, authenticated;
