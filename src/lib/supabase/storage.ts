import "server-only";
import { createClient } from "@/lib/supabase/server";

const PROJECT_REF = "zasshnqnexnuzmplolnu";
export const PUBLIC_URL_BASE =
  `https://${PROJECT_REF}.supabase.co/storage/v1/object/public`;

export type Bucket = "images" | "pdfs";

function safeFileName(name: string): string {
  const dot   = name.lastIndexOf(".");
  const base  = (dot > 0 ? name.slice(0, dot) : name).normalize("NFD")
                  .replace(/[̀-ͯ]/g, "")
                  .replace(/[^a-zA-Z0-9._-]+/g, "-")
                  .toLowerCase().slice(0, 80) || "file";
  const ext   = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const stamp = Date.now().toString(36);
  return ext ? `${base}-${stamp}.${ext}` : `${base}-${stamp}`;
}

/**
 * Upload a File from a server action to Supabase Storage.
 * Returns the public URL or throws.
 */
export async function uploadFileToBucket(file: File, bucket: Bucket, prefix = ""): Promise<string> {
  if (!file || file.size === 0) throw new Error("Empty file");

  const supabase = await createClient();
  const path = (prefix ? `${prefix.replace(/^\/|\/$/g, "")}/` : "") + safeFileName(file.name);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return `${PUBLIC_URL_BASE}/${bucket}/${path}`;
}

/** Extract storage path from a public URL (returns null if URL is not from our buckets). */
export function pathFromPublicUrl(url: string | null | undefined, bucket: Bucket): string | null {
  if (!url) return null;
  const prefix = `${PUBLIC_URL_BASE}/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function deleteByPublicUrl(url: string | null | undefined, bucket: Bucket): Promise<void> {
  const path = pathFromPublicUrl(url, bucket);
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
}
