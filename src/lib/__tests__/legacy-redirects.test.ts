import { describe, it, expect } from "vitest";
import { legacyRedirects } from "../../../legacy-redirects";

describe("legacyRedirects", () => {
  it("writes every source percent-encoded (Next.js matches the encoded pathname)", () => {
    for (const r of legacyRedirects) {
      expect(r.source, r.source).toMatch(/^[\x21-\x7e]+$/);
      expect(r.source.startsWith("/")).toBe(true);
    }
  });

  it("is permanent and points inside the site", () => {
    for (const r of legacyRedirects) {
      expect(r.permanent).toBe(true);
      expect(r.destination.startsWith("/")).toBe(true);
      expect(r.destination).not.toBe(r.source);
    }
  });

  it("has no duplicate sources", () => {
    const sources = legacyRedirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("covers the old pages Search Console still reports as 404", () => {
    const map = new Map(legacyRedirects.map((r) => [r.source, r.destination]));
    expect(map.get("/home")).toBe("/");
    expect(map.get(encodeURI("/συνεργάτες"))).toBe("/synergates");
    expect(map.get("/upologismos-morion")).toBe("/blog/pos-ypologizontai-ta-moria");
  });
});
