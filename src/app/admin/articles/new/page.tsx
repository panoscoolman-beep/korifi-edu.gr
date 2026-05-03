import { ArticleForm } from "../ArticleForm";

export const metadata = { title: "Νέο άρθρο" };

export default function NewArticle() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέο άρθρο</h1>
      <ArticleForm article={null} />
    </div>
  );
}
