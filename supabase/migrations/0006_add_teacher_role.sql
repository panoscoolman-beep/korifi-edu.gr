-- Phase 3: extend role enum to include 'teacher'
-- A teacher can author courses/lessons/articles but is not a full admin.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student','teacher','admin'));

-- is_teacher_or_admin() helper for RLS policies that grant teacher-write access
create or replace function public.is_teacher_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher','admin')
  );
$$;

grant execute on function public.is_teacher_or_admin() to anon, authenticated;

-- Update profiles update policy: user can edit full_name only — cannot self-promote
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
