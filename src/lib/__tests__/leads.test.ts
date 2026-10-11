import { describe, expect, it } from "vitest";
import { guessGrade, normalizeGreekPhone, validateLead } from "../leads";

describe("normalizeGreekPhone", () => {
  it("accepts greek mobiles and landlines in common spellings", () => {
    expect(normalizeGreekPhone("6941689194")).toBe("+306941689194");
    expect(normalizeGreekPhone("694 168 9194")).toBe("+306941689194");
    expect(normalizeGreekPhone("+30 22530 25080")).toBe("+302253025080");
    expect(normalizeGreekPhone("0030 6941689194")).toBe("+306941689194");
    expect(normalizeGreekPhone("30 6941689194")).toBe("+306941689194");
    expect(normalizeGreekPhone("(2253) 0-25080")).toBe("+302253025080");
  });

  it("accepts foreign numbers only with a leading plus", () => {
    expect(normalizeGreekPhone("+4915112345678")).toBe("+4915112345678");
    expect(normalizeGreekPhone("4915112345678")).toBeNull();
  });

  it("rejects garbage", () => {
    expect(normalizeGreekPhone("")).toBeNull();
    expect(normalizeGreekPhone("12345")).toBeNull();
    expect(normalizeGreekPhone("abc")).toBeNull();
    expect(normalizeGreekPhone("1941689194")).toBeNull();
    expect(normalizeGreekPhone("+30694168919")).toBeNull();
  });
});

describe("validateLead", () => {
  const good = {
    name: "  Μαρία   Π. ",
    phone: "694 168 9194",
    grade: "Β΄ Λυκείου",
    interest: "Μαθηματικά",
    source_path: "/courses/algebra-b-lykeiou",
    source_label: "Άλγεβρα Β Λυκείου",
  };

  it("normalises a good submission", () => {
    const v = validateLead(good);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.lead).toEqual({
      name: "Μαρία Π.",
      phone: "+306941689194",
      grade: "Β΄ Λυκείου",
      interest: "Μαθηματικά",
      source_path: "/courses/algebra-b-lykeiou",
      source_label: "Άλγεβρα Β Λυκείου",
    });
  });

  it("turns empty optionals into null", () => {
    const v = validateLead({ ...good, grade: "", interest: "", source_path: "", source_label: "" });
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.lead.grade).toBeNull();
    expect(v.lead.interest).toBeNull();
    expect(v.lead.source_path).toBeNull();
    expect(v.lead.source_label).toBeNull();
  });

  it("rejects missing name, bad phone and unknown grade", () => {
    expect(validateLead({ ...good, name: "Μ" })).toMatchObject({ ok: false });
    expect(validateLead({ ...good, phone: "123" })).toMatchObject({ ok: false });
    expect(validateLead({ ...good, grade: "Δ΄ Λυκείου" })).toMatchObject({ ok: false });
  });

  it("drops unsafe source paths instead of failing", () => {
    for (const p of ["//evil.com", "https://evil.com", "/a b", "/x\u0001y", "/" + "a".repeat(200)]) {
      const v = validateLead({ ...good, source_path: p });
      expect(v.ok).toBe(true);
      if (v.ok) expect(v.lead.source_path).toBeNull();
    }
  });
});

describe("guessGrade", () => {
  it("maps class names and page slugs", () => {
    expect(guessGrade("Α' Λυκείου")).toBe("Α΄ Λυκείου");
    expect(guessGrade("Β΄ Λυκείου")).toBe("Β΄ Λυκείου");
    expect(guessGrade("Γ΄ Γυμνασίου")).toBe("Γ΄ Γυμνασίου");
    expect(guessGrade("ΕΠΑΛ")).toBe("ΕΠΑΛ");
    expect(guessGrade("alikeiou")).toBe("Α΄ Λυκείου");
    expect(guessGrade("glikeiou")).toBe("Γ΄ Λυκείου");
    expect(guessGrade("Ε΄ Δημοτικού")).toBe("Ε΄–ΣΤ΄ Δημοτικού");
  });

  it("stays empty when the grade is ambiguous", () => {
    expect(guessGrade("Γυμνάσιο")).toBe("");
    expect(guessGrade("gimnasio")).toBe("");
    expect(guessGrade("online-mathimata")).toBe("");
    expect(guessGrade(null)).toBe("");
  });
});
