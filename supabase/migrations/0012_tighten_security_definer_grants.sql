-- Lock down SECURITY DEFINER helper functions exposed via PostgREST RPC.
-- These were created with default GRANT to PUBLIC which lets anyone POST to
-- /rest/v1/rpc/<fn> and execute them. Tighten so they're only callable from
-- inside RLS policies / server-side code.
--
-- ⚠️ NOTE: migration 0014 (restore_is_admin_execute_for_rls) DELIBERATELY
-- re-grants is_admin()/is_teacher_or_admin() to anon+authenticated — revoking
-- them breaks every public read (RLS policies call is_admin() in their USING).
-- Keep both migrations; do not "consolidate" by dropping this one.

-- is_admin() — only RLS policies need to call it; revoke from anon + authenticated.
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_admin() from authenticated;
-- Postgres internal roles (postgres, service_role) keep execute via ownership.

-- is_teacher_or_admin() — same treatment.
revoke execute on function public.is_teacher_or_admin() from public;
revoke execute on function public.is_teacher_or_admin() from anon;
revoke execute on function public.is_teacher_or_admin() from authenticated;

-- rls_auto_enable() — DDL-helper utility; should never be reachable from the API.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- redeem_course_access_code(text, uuid) stays callable by authenticated — that's
-- the public-facing endpoint students use to redeem codes. Documented intent.
