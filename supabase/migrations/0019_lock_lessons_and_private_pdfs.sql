-- Κλείδωμα υλικού μαθημάτων: μόνο admin ή εγγεγραμμένοι (με κωδικό πρόσβασης).
--
-- ΣΕΙΡΑ: εφαρμόζεται ΑΦΟΥ γίνει deploy ο κώδικας που σερβίρει τα PDF μέσω
-- /api/lessons/[id]/pdf (signed URLs). Αλλιώς τα PDF σπάνε για όλους.
--
-- 1. Τα 21 εισαγόμενα μαθήματα ήταν is_free = true → τα έβλεπε ο καθένας.
update public.lessons set is_free = false where is_free = true;

-- 2. Το bucket pdfs γίνεται ιδιωτικό (τα public URLs παύουν να δουλεύουν).
update storage.buckets set public = false where id = 'pdfs';

-- 3. Ο anon δεν απαριθμεί πια τα PDF. Το backup τρέχει με service role,
--    που παρακάμπτει το RLS, οπότε συνεχίζει να τα κατεβάζει κανονικά.
drop policy if exists "anon list public media (backup)" on storage.objects;
create policy "anon list public media (backup)"
on storage.objects
for select
to anon
using (bucket_id = 'images');

-- Rollback:
--   update storage.buckets set public = true where id = 'pdfs';
--   drop policy "anon list public media (backup)" on storage.objects;
--   create policy "anon list public media (backup)" on storage.objects
--     for select to anon using (bucket_id in ('images', 'pdfs'));
