-- Perf advisor remediation (multiple_permissive_policies + auth_rls_initplan).
--
-- Each content table had an "admin write" policy FOR ALL (qual is_admin()), which
-- overlapped the SELECT read policy on every public read and re-evaluated is_admin()
-- per row. Split each FOR ALL admin policy into explicit INSERT/UPDATE/DELETE (so it
-- no longer covers SELECT) and wrap is_admin() as (select is_admin()).
--
-- Read policies are left completely untouched → public reads are unaffected.
-- course_access_codes is excluded (admin-only, single policy, no overlap).
do $$
declare r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and cmd = 'ALL'
      and qual = 'is_admin()'
      and tablename <> 'course_access_codes'
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
    execute format('create policy %I on public.%I for insert to public with check ((select is_admin()))', r.tablename || ' admin insert', r.tablename);
    execute format('create policy %I on public.%I for update to public using ((select is_admin())) with check ((select is_admin()))', r.tablename || ' admin update', r.tablename);
    execute format('create policy %I on public.%I for delete to public using ((select is_admin()))', r.tablename || ' admin delete', r.tablename);
  end loop;
end $$;
