-- Stable reference back to the source folder name (e.g. Drive folder name).
-- Used by the auto-sync script to decide whether a testimonial has already
-- been imported, so re-runs are idempotent.

alter table public.testimonials
  add column if not exists source_ref text unique;

comment on column public.testimonials.source_ref is
  'Stable external identifier for the testimonial source (e.g. Google Drive folder name like "2026-05-03-post-testimonial-stratis"). Used for sync deduplication.';
