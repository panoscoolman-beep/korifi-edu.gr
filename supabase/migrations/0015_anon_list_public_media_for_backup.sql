-- Allow the anon role (publishable key) to LIST objects in the two PUBLIC
-- buckets, so an offsite backup job can enumerate them. Objects in these
-- buckets are already publicly downloadable; this only enables listing.
-- Scoped to SELECT + these buckets; additive to the existing admin policies.
-- Reversible: DROP POLICY "anon list public media (backup)" ON storage.objects;
CREATE POLICY "anon list public media (backup)"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id IN ('images', 'pdfs'));
