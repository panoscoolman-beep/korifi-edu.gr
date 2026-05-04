-- Add icon emoji to courses (mirroring subjects.icon).
-- Public + admin queries already SELECT * so the new column flows through
-- without UI changes; specific renderers can opt into displaying it.

alter table public.courses
  add column if not exists icon text;

comment on column public.courses.icon is
  'Emoji shown next to the course title (e.g. 🔢, ⚛️, 🧪). Optional.';
