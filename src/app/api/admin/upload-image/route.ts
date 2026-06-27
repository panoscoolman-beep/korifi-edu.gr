import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadFileToBucket } from "@/lib/supabase/storage";

const MAX = 8 * 1024 * 1024; // 8MB
// SVG intentionally excluded: SVGs in the public bucket can carry inline
// <script> and would execute if opened directly. Raster formats only.
const OK_TYPES = ["image/jpeg","image/png","image/webp","image/gif"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))    return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX)            return NextResponse.json({ error: "Πολύ μεγάλο (>8MB)" }, { status: 400 });
  if (!OK_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Μη υποστηριζόμενος τύπος: ${file.type}` }, { status: 400 });
  }

  try {
    const url = await uploadFileToBucket(file, "images", "admin");
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
