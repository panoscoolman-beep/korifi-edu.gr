import { describe, it, expect } from "vitest";
import { safeBearerEqual } from "../security";

describe("safeBearerEqual", () => {
  it("accepts a matching Bearer token", () => {
    expect(safeBearerEqual("Bearer secret-123", "secret-123")).toBe(true);
  });

  it("rejects a wrong token", () => {
    expect(safeBearerEqual("Bearer nope", "secret-123")).toBe(false);
  });

  it("rejects a token of a different length", () => {
    expect(safeBearerEqual("Bearer secret-1234", "secret-123")).toBe(false);
  });

  it("requires the Bearer prefix", () => {
    expect(safeBearerEqual("secret-123", "secret-123")).toBe(false);
  });

  it("fails closed when the secret is missing or empty", () => {
    expect(safeBearerEqual("Bearer ", "")).toBe(false);
    expect(safeBearerEqual("Bearer x", undefined)).toBe(false);
    expect(safeBearerEqual("Bearer x", null)).toBe(false);
  });

  it("rejects a null/empty Authorization header", () => {
    expect(safeBearerEqual(null, "secret")).toBe(false);
    expect(safeBearerEqual(undefined, "secret")).toBe(false);
    expect(safeBearerEqual("", "secret")).toBe(false);
  });
});
