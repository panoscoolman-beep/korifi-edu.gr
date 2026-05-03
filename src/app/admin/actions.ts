"use server";

/**
 * Shared admin server actions: generic create / update / delete by table name.
 * All operations route through Supabase with the admin's session — RLS allows admin writes.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Table =
  | "pages" | "articles" | "teachers" | "events"
  | "testimonials" | "partners" | "subjects" | "courses" | "lessons";

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                    */
/* ------------------------------------------------------------------ */

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") throw new Error("Admin only");
  return supabase;
}

function fdToObject(fd: FormData, opts: {
  booleans?: string[]; numbers?: string[]; nullables?: string[]; ignore?: string[];
} = {}) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (opts.ignore?.includes(k)) continue;
    if (k.startsWith("__")) continue;
    if (opts.booleans?.includes(k)) { out[k] = v === "on" || v === "true"; continue; }
    if (opts.numbers?.includes(k))  { out[k] = v === "" ? null : Number(v); continue; }
    const s = typeof v === "string" ? v : String(v);
    if (opts.nullables?.includes(k) && s.trim() === "") { out[k] = null; continue; }
    out[k] = s;
  }
  for (const b of opts.booleans ?? []) if (!(b in out)) out[b] = false;
  return out;
}

/* ------------------------------------------------------------------ */
/*  Per-resource actions                                               */
/* ------------------------------------------------------------------ */

const RESOURCE_CONFIG: Record<Table, {
  listPath: string;
  booleans?: string[]; numbers?: string[]; nullables?: string[];
}> = {
  pages: {
    listPath: "/admin/pages",
    booleans: ["is_published"],
    numbers:  ["sort_order"],
    nullables:["cover_image","meta_description"],
  },
  articles: {
    listPath: "/admin/articles",
    booleans: ["is_published"],
    nullables:["excerpt","cover_image","author_name","published_at"],
  },
  teachers: {
    listPath: "/admin/teachers",
    booleans: ["is_published"],
    numbers:  ["sort_order"],
    nullables:["role","photo_url","email"],
  },
  events: {
    listPath: "/admin/events",
    booleans: ["is_online","is_published"],
    nullables:["cover_image","starts_at","ends_at","location","link_url"],
  },
  testimonials: {
    listPath: "/admin/testimonials",
    booleans: ["is_published"],
    numbers:  ["sort_order"],
    nullables:["author_role","photo_url"],
  },
  partners: {
    listPath: "/admin/partners",
    booleans: ["is_published"],
    numbers:  ["sort_order"],
    nullables:["logo_url","website_url"],
  },
  subjects: {
    listPath: "/admin/subjects",
    numbers:  ["order"],
    nullables:["icon"],
  },
  courses: {
    listPath: "/admin/courses",
    booleans: ["is_free"],
    nullables:["description","cover_image"],
  },
  lessons: {
    listPath: "/admin/lessons",
    booleans: ["is_free"],
    numbers:  ["order"],
    nullables:["pdf_url","content","cover_image"],
  },
};

export async function saveResource(table: Table, id: string | null, _prev: unknown, fd: FormData) {
  const cfg = RESOURCE_CONFIG[table];
  const supabase = await assertAdmin();
  const payload  = fdToObject(fd, cfg);

  const { error } = id
    ? await supabase.from(table).update(payload).eq("id", id)
    : await supabase.from(table).insert(payload);

  if (error) return { error: error.message };

  revalidatePath(cfg.listPath, "page");
  revalidatePath("/", "layout");
  redirect(cfg.listPath);
}

export async function deleteResource(table: Table, id: string) {
  const cfg = RESOURCE_CONFIG[table];
  const supabase = await assertAdmin();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(cfg.listPath, "page");
  revalidatePath("/", "layout");
  redirect(cfg.listPath);
}

/* ------------------------------------------------------------------ */
/*  Users management (separate — touches profiles)                     */
/* ------------------------------------------------------------------ */

export async function setUserRole(userId: string, role: "student"|"teacher"|"admin") {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users", "page");
}
