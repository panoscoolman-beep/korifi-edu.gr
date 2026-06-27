import { defaultSchema } from "rehype-sanitize";

/**
 * Sanitize schema for Markdown that is rendered as HTML via `rehype-raw`.
 *
 * Starts from rehype-sanitize's safe default (strips <script>, event-handler
 * attributes like onerror/onclick, javascript: URLs, etc.) and re-allows only
 * the few extras our content legitimately uses: links that open in a new tab.
 * GFM tables, images (src/alt/title) and headings are already permitted by the
 * default schema.
 *
 * Exported standalone so it can be unit-tested independently of React.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};
