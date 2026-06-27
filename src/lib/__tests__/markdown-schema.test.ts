import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { markdownSanitizeSchema } from "../markdown-schema";

// Mirrors the plugin chain used by <Markdown> (remark-gfm + rehype-raw +
// rehype-sanitize) so the test exercises the exact schema the site renders.
async function render(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, markdownSanitizeSchema)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

describe("markdownSanitizeSchema", () => {
  it("strips <script> tags", async () => {
    const out = await render("Γεια\n\n<script>alert(1)</script>");
    expect(out).not.toContain("<script");
  });

  it("strips event-handler attributes (onerror)", async () => {
    const out = await render('<img src="x" onerror="alert(1)">');
    expect(out.toLowerCase()).not.toContain("onerror");
  });

  it("strips javascript: URLs", async () => {
    const out = await render('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("keeps safe formatting: headings, bold, links, GFM tables", async () => {
    const out = await render(
      "# Τίτλος\n\n**έντονα** και [σύνδεσμος](https://korifi-edu.gr)\n\n| a | b |\n|---|---|\n| 1 | 2 |",
    );
    expect(out).toContain("<h1");
    expect(out).toContain("<strong");
    expect(out).toContain('href="https://korifi-edu.gr"');
    expect(out).toContain("<table");
  });
});
