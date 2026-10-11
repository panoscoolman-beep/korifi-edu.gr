-- Leads από τη φόρμα «Κλείσε δωρεάν διαγνωστικό» + μετρήσεις μετατροπών
-- (κλικ τηλεφώνου / WhatsApp / Viber / υποβολή φόρμας) χωρίς cookies.
--
-- Εγγραφή στα leads γίνεται ΜΟΝΟ από το server action (service role, παρακάμπτει
-- το RLS). Ο anon δεν έχει καμία πολιτική: ούτε διαβάζει ούτε γράφει.

create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  phone         text not null,            -- E.164, π.χ. +306941689194
  grade         text,                     -- τάξη (από τη λίστα της φόρμας)
  interest      text,                     -- μάθημα / τι τον ενδιαφέρει
  source_path   text,                     -- από ποια σελίδα ήρθε (/courses/..., /blog/...)
  source_label  text,                     -- τίτλος της σελίδας
  status        text not null default 'new'
                check (status in ('new', 'contacted', 'booked', 'enrolled', 'lost')),
  notes         text,                     -- σημειώσεις admin
  notified_at   timestamptz               -- πότε στάλθηκε η ειδοποίηση email
);

create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

create policy "leads admin select" on public.leads
  for select to authenticated
  using ((select public.is_admin()));

create policy "leads admin update" on public.leads
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "leads admin delete" on public.leads
  for delete to authenticated
  using ((select public.is_admin()));

-- Μετρήσεις: ένα row ανά κλικ. Χωρίς IP, χωρίς cookie, χωρίς user id.
create table public.site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null
              check (name in ('call_click', 'whatsapp_click', 'viber_click', 'lead_submit')),
  path        text,                       -- σελίδα όπου έγινε το κλικ
  place       text                        -- footer / fab / content / form
);

create index site_events_created_at_idx on public.site_events (created_at desc);

alter table public.site_events enable row level security;

create policy "site_events admin select" on public.site_events
  for select to authenticated
  using ((select public.is_admin()));

-- Rollback:
--   drop table public.site_events;
--   drop table public.leads;
