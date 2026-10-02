import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pathFromPublicUrl } from "@/lib/supabase/storage";
import { getLessonById } from "@/lib/queries";

/**
 * Σερβίρει το PDF μιας ενότητας μόνο σε όσους έχουν πρόσβαση.
 *
 * Το bucket `pdfs` είναι ιδιωτικό. Ο έλεγχος γίνεται με τον client του χρήστη
 * (RLS: admin ή εγγεγραμμένος στο μάθημα)· μόνο αν περάσει, φτιάχνουμε
 * signed URL λίγων λεπτών με service role και κάνουμε redirect εκεί.
 */
export const dynamic = "force-dynamic";

const SIGNED_URL_TTL = 60 * 10; // 10 λεπτά — αρκεί για άνοιγμα/κατέβασμα

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const lesson = await getLessonById(supabase, id);

  if (!lesson?.pdf_url) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", `/lessons/${id}`);
      return NextResponse.redirect(login);
    }
    return NextResponse.json({ error: "Δεν έχεις πρόσβαση σε αυτό το αρχείο." }, { status: 403 });
  }

  const path = pathFromPublicUrl(lesson.pdf_url, "pdfs");
  if (!path) return NextResponse.redirect(lesson.pdf_url); // εξωτερικό link

  const download = req.nextUrl.searchParams.has("download");
  const { data, error } = await createAdminClient()
    .storage.from("pdfs")
    .createSignedUrl(path, SIGNED_URL_TTL, download ? { download: true } : undefined);
  if (error || !data) {
    return NextResponse.json({ error: "Το αρχείο δεν βρέθηκε." }, { status: 404 });
  }

  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
