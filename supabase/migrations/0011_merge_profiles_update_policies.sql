-- Merge the two permissive UPDATE policies on profiles into one (clears the last
-- multiple_permissive_policies lints). The single policy is the exact OR-union of
-- "profiles admin update" (from 0009) and the old "profiles update own":
--   USING:      admin OR own-row
--   WITH CHECK: admin OR (own-row AND role unchanged)  ← keeps the role-escalation guard
drop policy "profiles admin update" on public.profiles;
create policy "profiles update" on public.profiles
  for update to public
  using ((select is_admin()) OR (id = (select auth.uid())))
  with check (
    (select is_admin())
    OR (
      id = (select auth.uid())
      AND role = ( select profiles_1.role from profiles profiles_1
                   where profiles_1.id = (select auth.uid()) )
    )
  );
