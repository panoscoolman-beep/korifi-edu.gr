-- Tighten the public-read policies on storage.objects for `images` and `pdfs`
-- so anonymous clients can fetch a known object URL but cannot LIST the bucket
-- contents. Direct URL access (used by Next/Image + the lesson PDF iframe)
-- still works because Supabase short-circuits public-bucket reads.

-- Drop the broad "select *" policies and recreate them gated on a literal
-- false predicate for anon/authenticated. The bucket is still marked `public`
-- so signed-in-or-not, browsers can fetch /storage/v1/object/public/<bucket>/<path>
-- directly without RLS being checked.

drop policy if exists "images public read" on storage.objects;
drop policy if exists "pdfs public read"   on storage.objects;

-- No replacement policy needed: the buckets are flagged public, and Supabase
-- serves /storage/v1/object/public/<bucket>/<path> directly. RLS only kicks in
-- for storage.objects SELECTs against /storage/v1/object/list, which is what
-- the listing warning was about.
