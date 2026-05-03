-- Gallery: albums (events/activities) + photos within each album
create table public.gallery_albums (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  cover_image  text,
  event_date   date,
  sort_order   int  not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index gallery_albums_published_idx on public.gallery_albums(is_published, sort_order);

create table public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references public.gallery_albums(id) on delete cascade,
  image_url   text not null,
  caption     text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index gallery_photos_album_idx on public.gallery_photos(album_id, sort_order);

alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;

create policy "gallery_albums read published"
  on public.gallery_albums for select
  using (is_published or public.is_admin());
create policy "gallery_albums admin write"
  on public.gallery_albums for all
  using (public.is_admin()) with check (public.is_admin());

create policy "gallery_photos read"
  on public.gallery_photos for select
  using (
    public.is_admin()
    or exists (select 1 from public.gallery_albums a where a.id = gallery_photos.album_id and a.is_published)
  );
create policy "gallery_photos admin write"
  on public.gallery_photos for all
  using (public.is_admin()) with check (public.is_admin());
