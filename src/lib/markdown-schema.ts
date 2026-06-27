import { defaultSchema } from "rehype-sanitize";

/**
 * Sanitize schema for Markdown rendered as HTML via `rehype-raw`.
 *
 * The CMS pages (Γυμνάσιο, Α/Β/Γ Λυκείου, ΕΠΑΛ, Επικοινωνία, …) are authored as
 * rich **Tailwind-classed HTML** — blue gradient heading boxes, styled card/table
 * sections, `tel:` links and a Google-Maps iframe. So this schema is deliberately
 * permissive about *presentation* (keeps `class`/`style`/`id`, structural & table
 * tags, the iframe embed, `tel:`/`mailto:` links) while still **blocking script
 * execution**: `<script>` is not allowed, event-handler attributes (`onerror`,
 * `onclick`, …) are not in any allow-list, and `javascript:` URLs are rejected by
 * the protocol allow-list. That is the meaningful XSS protection; the styling is
 * what the content legitimately relies on.
 *
 * Exported standalone so it can be unit-tested independently of React.
 */
const uniq = (xs: unknown[]) => Array.from(new Set(xs)) as string[];

const PRESENTATION_TAGS = [
  "div", "span", "section", "header", "footer", "article", "aside",
  "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "mark", "small", "sub", "sup", "u", "details", "summary",
  "picture", "source", "iframe",
];

export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: uniq([...(defaultSchema.tagNames ?? []), ...PRESENTATION_TAGS]),
  protocols: {
    ...defaultSchema.protocols,
    // allow tel: links used on the contact page (default already has mailto/http/https)
    href: uniq([...(defaultSchema.protocols?.href ?? []), "tel", "mailto"]),
  },
  attributes: {
    ...defaultSchema.attributes,
    // keep Tailwind classes / inline styles / ids on every element
    "*": uniq([...(defaultSchema.attributes?.["*"] ?? []), "className", "style", "id"]),
    a: uniq([...(defaultSchema.attributes?.a ?? []), "href", "title", "target", "rel"]),
    img: uniq([...(defaultSchema.attributes?.img ?? []), "src", "alt", "title", "width", "height", "loading"]),
    td: uniq([...(defaultSchema.attributes?.td ?? []), "colspan", "rowspan", "align"]),
    th: uniq([...(defaultSchema.attributes?.th ?? []), "colspan", "rowspan", "align", "scope"]),
    // Google-Maps / video embeds (admin-authored only)
    iframe: ["src", "width", "height", "title", "loading", "allow", "allowfullscreen", "referrerpolicy", "frameborder", "style", "className"],
  },
};
