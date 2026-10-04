import type { LeadStatus, SiteEventName } from "@/types/database";

/** Τάξεις της φόρμας. Η τιμή αποθηκεύεται αυτούσια στο `leads.grade`. */
export const GRADES = [
  "Ε΄–ΣΤ΄ Δημοτικού",
  "Α΄ Γυμνασίου",
  "Β΄ Γυμνασίου",
  "Γ΄ Γυμνασίου",
  "Α΄ Λυκείου",
  "Β΄ Λυκείου",
  "Γ΄ Λυκείου",
  "ΕΠΑΛ",
  "Άλλο",
] as const;
export type Grade = (typeof GRADES)[number];

export const LEAD_STATUSES: readonly LeadStatus[] = ["new", "contacted", "booked", "enrolled", "lost"];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Νέο",
  contacted: "Μιλήσαμε",
  booked: "Κλείστηκε διαγνωστικό",
  enrolled: "Εγγράφηκε",
  lost: "Δεν προχώρησε",
};

export const SITE_EVENT_NAMES: readonly SiteEventName[] = [
  "call_click", "whatsapp_click", "lead_submit",
];

export const SITE_EVENT_LABEL: Record<SiteEventName, string> = {
  call_click: "Κλικ τηλεφώνου",
  whatsapp_click: "Κλικ WhatsApp",
  lead_submit: "Φόρμες",
};

/**
 * Κανονικοποιεί ελληνικό τηλέφωνο σε E.164 (+30XXXXXXXXXX).
 * Δέχεται «6941689194», «694 168 9194», «+30 22530 25080», «0030…».
 * Ξένοι αριθμοί δεκτοί μόνο με «+» (γονείς στο εξωτερικό). Αλλιώς `null`.
 */
export function normalizeGreekPhone(raw: string): string | null {
  let s = raw.replace(/[\s\-().]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (/^\+30\d{10}$/.test(s)) return s;
  if (/^30\d{10}$/.test(s)) return `+${s}`;
  if (/^\d{10}$/.test(s) && (s.startsWith("69") || s.startsWith("2"))) return `+30${s}`;
  if (/^\+\d{8,15}$/.test(s) && !s.startsWith("+30")) return s;
  return null;
}

export type LeadRecord = {
  name: string;
  phone: string;
  grade: string | null;
  interest: string | null;
  source_path: string | null;
  source_label: string | null;
};

type Validation = { ok: true; lead: LeadRecord } | { ok: false; error: string };

/** Ελέγχει και καθαρίζει τα πεδία της φόρμας. Τα μηνύματα είναι για τον γονιό. */
export function validateLead(input: Record<string, unknown>): Validation {
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");

  const name = str("name").replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "Γράψε το όνομά σου." };
  if (name.length > 80) return { ok: false, error: "Το όνομα είναι πολύ μεγάλο." };

  const phone = normalizeGreekPhone(str("phone"));
  if (!phone) return { ok: false, error: "Γράψε ένα σωστό κινητό ή σταθερό (π.χ. 69xxxxxxxx)." };

  const grade = str("grade");
  if (grade && !(GRADES as readonly string[]).includes(grade)) {
    return { ok: false, error: "Διάλεξε τάξη από τη λίστα." };
  }

  const interest = str("interest").slice(0, 120);
  const sourceLabel = str("source_label").slice(0, 120);

  return {
    ok: true,
    lead: {
      name,
      phone,
      grade: grade || null,
      interest: interest || null,
      source_path: safeSourcePath(str("source_path")),
      source_label: sourceLabel || null,
    },
  };
}

function safeSourcePath(p: string): string | null {
  if (!p.startsWith("/") || p.startsWith("//") || p.length > 200) return null;
  if (/[\u0000-\u001f\s]/.test(p)) return null;
  return p;
}

/**
 * Μαντεύει την τάξη από ένα κείμενο (όνομα τάξης/μαθήματος ή slug σελίδας),
 * για να προσυμπληρωθεί το select. Αν δεν είναι σαφές, επιστρέφει "".
 */
export function guessGrade(text: string | null | undefined): Grade | "" {
  if (!text) return "";
  const t = text.toLowerCase().replace(/[΄'’ʹ]/g, "'").replace(/\s+/g, " ");

  const slug: Record<string, Grade> = { alikeiou: "Α΄ Λυκείου", blikeiou: "Β΄ Λυκείου", glikeiou: "Γ΄ Λυκείου", epal: "ΕΠΑΛ" };
  if (slug[t]) return slug[t];

  if (t.includes("δημοτ")) return "Ε΄–ΣΤ΄ Δημοτικού";
  if (t.includes("επαλ")) return "ΕΠΑΛ";

  const m = t.match(/(?:^|[^α-ω])([αβγ])'? ?(γυμνασ|λυκ)/);
  if (m) {
    const letter = { α: "Α΄", β: "Β΄", γ: "Γ΄" }[m[1]];
    const level = m[2] === "λυκ" ? "Λυκείου" : "Γυμνασίου";
    return `${letter} ${level}` as Grade;
  }
  return "";
}
