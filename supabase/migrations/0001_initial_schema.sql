-- =====================================================================
-- korifi-edu.gr — Initial schema (Phase 1.3)
-- =====================================================================
-- Run this in Supabase SQL Editor on a fresh project.
-- Tables: subjects, courses, lessons, enrollments, profiles
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  "order"     int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  description  text,
  subject_id   uuid not null references public.subjects(id) on delete restrict,
  is_free      boolean not null default false,
  cover_image  text,
  created_at   timestamptz not null default now()
);
create index courses_subject_id_idx on public.courses(subject_id);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  course_id     uuid not null references public.courses(id) on delete cascade,
  "order"       int  not null default 0,
  content_type  text not null check (content_type in ('pdf','text')),
  pdf_url       text,
  content       text,
  is_free       boolean not null default false,
  created_at    timestamptz not null default now(),
  -- Each lesson must have content matching its type
  constraint lesson_pdf_has_url   check (content_type <> 'pdf'  or pdf_url is not null),
  constraint lesson_text_has_body check (content_type <> 'text' or content is not null)
);
create index lessons_course_id_idx on public.lessons(course_id);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'student' check (role in ('student','admin')),
  created_at  timestamptz not null default now()
);

create table public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  enrolled_at  timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_user_id_idx   on public.enrollments(user_id);
create index enrollments_course_id_idx on public.enrollments(course_id);

-- ---------------------------------------------------------------------
-- Auto-create profile when a user signs up
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helper: is_admin() — used in RLS policies
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.subjects    enable row level security;
alter table public.courses     enable row level security;
alter table public.lessons     enable row level security;
alter table public.profiles    enable row level security;
alter table public.enrollments enable row level security;

-- subjects: world-readable, admin writes
create policy "subjects readable by all"
  on public.subjects for select
  using (true);
create policy "subjects writable by admin"
  on public.subjects for all
  using (public.is_admin()) with check (public.is_admin());

-- courses: world-readable (catalog visible to anonymous), admin writes
create policy "courses readable by all"
  on public.courses for select
  using (true);
create policy "courses writable by admin"
  on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- lessons: free OR enrolled OR admin can read; admin writes
create policy "lessons readable by entitled users"
  on public.lessons for select
  using (
    is_free
    or public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.course_id = lessons.course_id
        and e.user_id   = auth.uid()
    )
  );
create policy "lessons writable by admin"
  on public.lessons for all
  using (public.is_admin()) with check (public.is_admin());

-- profiles: user reads/updates own; admin reads/writes all
create policy "profiles select own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles update own"
  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = 'student');
create policy "profiles admin write"
  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- enrollments: user reads own; admin manages
create policy "enrollments select own"
  on public.enrollments for select
  using (user_id = auth.uid() or public.is_admin());
create policy "enrollments admin write"
  on public.enrollments for all
  using (public.is_admin()) with check (public.is_admin());
