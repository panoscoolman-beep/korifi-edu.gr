-- Lock down SECURITY DEFINER functions: revoke RPC access from anon/authenticated.
-- Trigger and RLS-policy invocations still work (they don't go through PostgREST).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin()        from public, anon;
-- is_admin() must stay callable by `authenticated` because RLS policies invoke it
-- under the caller's role. Keep that grant.
