import { describe, it, expect } from "vitest";
import { safeBearerEqual, safeNext } from "../security";
import { passwordProblem } from "../password";

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

describe("safeNext", () => {
  it("keeps internal paths", () => {
    expect(safeNext("/courses/fysiki-g-lykeiou")).toBe("/courses/fysiki-g-lykeiou");
    expect(safeNext("/reset-password")).toBe("/reset-password");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
  });

  it("falls back when missing", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
  });
});

describe("passwordProblem", () => {
  it("matches the Supabase Auth rules (10+, lower, upper, digit)", () => {
    expect(passwordProblem("kalimera1")).not.toBeNull();
    expect(passwordProblem("kalimera123")).not.toBeNull();
    expect(passwordProblem("Kalimera123")).toBeNull();
  });
});
