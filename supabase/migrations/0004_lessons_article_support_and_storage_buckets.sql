-- Lessons: support 'article' content type (markdown body) + per-lesson cover image
alter table public.lessons drop constraint lessons_content_type_check;
alter table public.lessons add constraint lessons_content_type_check
  check (content_type in ('pdf','text','article'));

alter table public.lessons add column cover_image text;

alter table public.lessons drop constraint lesson_text_has_body;
alter table public.lessons add constraint lesson_body_present check (
  (content_type = 'pdf' and pdf_url is not null)
  or (content_type in ('text','article') and content is not null)
);

-- Storage buckets ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('images', 'images', true),
  ('pdfs',   'pdfs',   true)
on conflict (id) do nothing;

create policy "images public read"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "images admin write"
  on storage.objects for all
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "pdfs public read"
  on storage.objects for select
  using (bucket_id = 'pdfs');

create policy "pdfs admin write"
  on storage.objects for all
  using (bucket_id = 'pdfs' and public.is_admin())
  with check (bucket_id = 'pdfs' and public.is_admin());
