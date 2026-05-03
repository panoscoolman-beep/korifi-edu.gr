import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "../TestimonialForm";
import type { Testimonial } from "@/types/database";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Επεξεργασία μαρτυρίας" };

export default async function EditTestimonial({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{(data as Testimonial).author_name}</h1>
      <TestimonialForm item={data as Testimonial} />
    </div>
  );
}
