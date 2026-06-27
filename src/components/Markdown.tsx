import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { markdownSanitizeSchema } from "@/lib/markdown-schema";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-brand-700 prose-strong:text-slate-900 prose-table:my-6 prose-th:bg-brand-50 prose-th:text-brand-900 prose-td:py-2 prose-th:py-2">
      {/* rehypeRaw expands raw HTML in the Markdown → rehypeSanitize MUST run
          after it to strip any <script>/onerror/javascript: that comes through. */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
