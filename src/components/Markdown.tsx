import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-brand-700 prose-strong:text-slate-900">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
