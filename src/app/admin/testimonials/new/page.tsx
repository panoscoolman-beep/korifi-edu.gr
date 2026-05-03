import { TestimonialForm } from "../TestimonialForm";

export const metadata = { title: "Νέα μαρτυρία" };

export default function NewTestimonial() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέα μαρτυρία</h1>
      <TestimonialForm item={null} />
    </div>
  );
}
