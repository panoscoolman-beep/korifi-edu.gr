-- Long-form testimonial body for the popup. The existing `quote` column
-- holds the pull-quote shown on cards. `full_quote` is the full Instagram
-- caption text shown when the user clicks a card.
alter table public.testimonials
  add column if not exists full_quote text;

comment on column public.testimonials.full_quote is
  'Full testimonial body (multi-paragraph) shown in the popup. Plain text or simple Markdown. Falls back to `quote` if null.';
