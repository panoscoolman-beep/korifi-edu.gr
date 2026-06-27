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

  // The CMS pages rely on Tailwind-classed raw HTML — these must survive.
  it("preserves class on styled blocks (blue heading boxes / cards)", async () => {
    const out = await render(
      '<div class="not-prose bg-gradient-to-br from-brand-600 to-brand-800 text-white">Γεια</div>',
    );
    expect(out).toContain("<div");
    expect(out).toContain("bg-gradient-to-br from-brand-600 to-brand-800");
  });

  it("preserves structural tags, tel: links and the maps iframe", async () => {
    const sectionOut = await render('<section class="card"><header class="bg-brand-700">x</header></section>');
    expect(sectionOut).toContain("<section");
    expect(sectionOut).toContain("<header");

    const telOut = await render('<a href="tel:+302253025080">κλήση</a>');
    expect(telOut).toContain('href="tel:+302253025080"');

    const iframeOut = await render('<iframe src="https://www.google.com/maps/embed?pb=1" title="map"></iframe>');
    expect(iframeOut).toContain("<iframe");
    expect(iframeOut).toContain("https://www.google.com/maps/embed");
  });
});
