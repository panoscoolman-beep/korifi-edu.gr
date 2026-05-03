-- =====================================================================
-- Phase 2.5 — Content types: articles, pages, teachers, events,
-- testimonials, partners
-- =====================================================================

-- Articles (blog posts)
create table public.articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  content_md      text not null default '',
  cover_image     text,
  author_name     text,
  published_at    timestamptz,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index articles_published_idx on public.articles(is_published, published_at desc);

-- Pages (static CMS pages: Αρχική, Για εμάς, Συνεργάτες, Γυμνάσιο, Λύκειο…)
create table public.pages (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  content_md        text not null default '',
  cover_image       text,
  meta_description  text,
  sort_order        int not null default 0,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index pages_published_idx on public.pages(is_published, sort_order);

-- Page sections (modals / popups / repeated blocks linked to a page)
create table public.page_sections (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references public.pages(id) on delete cascade,
  kind         text not null check (kind in ('content','modal','cta','accordion','gallery')),
  title        text,
  body_md      text not null default '',
  sort_order   int not null default 0,
  metadata     jsonb not null default '{}'::jsonb
);
create index page_sections_page_idx on public.page_sections(page_id, sort_order);

-- Teachers
create table public.teachers (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  full_name       text not null,
  role            text,
  bio_md          text not null default '',
  photo_url       text,
  email           text,
  social_links    jsonb not null default '{}'::jsonb,
  sort_order      int not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Events / Σεμινάρια
create table public.events (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  description_md   text not null default '',
  cover_image      text,
  starts_at        timestamptz,
  ends_at          timestamptz,
  location         text,
  link_url         text,
  is_online        boolean not null default false,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);
create index events_starts_idx on public.events(starts_at desc);

-- Testimonials
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  author_role   text,
  quote         text not null,
  photo_url     text,
  sort_order    int not null default 0,
  is_published  boolean not null default false
);

-- Partners
create table public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo_url      text,
  website_url   text,
  sort_order    int not null default 0,
  is_published  boolean not null default false
);

-- ---------------------------------------------------------------------
-- RLS — public can read published rows; admin writes everything
-- ---------------------------------------------------------------------

alter table public.articles      enable row level security;
alter table public.pages         enable row level security;
alter table public.page_sections enable row level security;
alter table public.teachers      enable row level security;
alter table public.events        enable row level security;
alter table public.testimonials  enable row level security;
alter table public.partners      enable row level security;

create policy "articles read published"      on public.articles      for select using (is_published or public.is_admin());
create policy "articles admin write"         on public.articles      for all using (public.is_admin()) with check (public.is_admin());

create policy "pages read published"         on public.pages         for select using (is_published or public.is_admin());
create policy "pages admin write"            on public.pages         for all using (public.is_admin()) with check (public.is_admin());

create policy "page_sections read published" on public.page_sections for select
  using (
    public.is_admin()
    or exists (select 1 from public.pages p where p.id = page_sections.page_id and p.is_published)
  );
create policy "page_sections admin write"    on public.page_sections for all using (public.is_admin()) with check (public.is_admin());

create policy "teachers read published"      on public.teachers      for select using (is_published or public.is_admin());
create policy "teachers admin write"         on public.teachers      for all using (public.is_admin()) with check (public.is_admin());

create policy "events read published"        on public.events        for select using (is_published or public.is_admin());
create policy "events admin write"           on public.events        for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonials read published"  on public.testimonials  for select using (is_published or public.is_admin());
create policy "testimonials admin write"     on public.testimonials  for all using (public.is_admin()) with check (public.is_admin());

create policy "partners read published"      on public.partners      for select using (is_published or public.is_admin());
create policy "partners admin write"         on public.partners      for all using (public.is_admin()) with check (public.is_admin());
