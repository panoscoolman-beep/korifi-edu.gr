-- auth_rls_initplan remediation: wrap auth.uid()/is_admin() in (select …) so they
-- are evaluated once per query instead of once per row. Semantics-preserving:
-- (select auth.uid()) returns the same uuid as auth.uid() for every row.
-- Read policies are otherwise reproduced exactly as they were.

-- lessons: free OR admin OR enrolled
drop policy "lessons readable by entitled users" on public.lessons;
create policy "lessons readable by entitled users" on public.lessons
  for select to public
  using (
    is_free
    OR (select is_admin())
    OR (exists ( select 1 from enrollments e
                 where e.course_id = lessons.course_id
                   and e.user_id = (select auth.uid()) ))
  );

-- profiles: own row OR admin
drop policy "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select to public
  using ((id = (select auth.uid())) OR (select is_admin()));

-- enrollments: own rows OR admin
drop policy "enrollments select own" on public.enrollments;
create policy "enrollments select own" on public.enrollments
  for select to public
  using ((user_id = (select auth.uid())) OR (select is_admin()));

-- NOTE: profiles "update own" is rewritten in 0011 (merged with admin update).
