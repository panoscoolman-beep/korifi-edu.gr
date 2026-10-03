/**
 * Στοιχεία επικοινωνίας της Κορυφής — μία πηγή για footer, κουμπί επικοινωνίας
 * και φόρμα. Αλλαγή εδώ = αλλαγή παντού.
 */
export const CONTACT = {
  address: "Καλλονή Λέσβου, ΤΚ 81107",
  phone: "22530 25080",
  phoneE164: "+302253025080",
  email: "frontistiriokorifh@gmail.com",
  /** WhatsApp Business: στο σταθερό 22530 25080 (επιβεβαίωση Πάνου 3/10/2026). */
  whatsappE164: "+302253025080",
  /** Viber: κινητό 6941 689 194 (προς επιβεβαίωση). */
  viberE164: "+306941689194",
  instagram: "https://www.instagram.com/frontistiriakorifh/",
} as const;

export const DEFAULT_MESSAGE = "Γεια σας, ενδιαφέρομαι για μαθήματα στην Κορυφή.";

/** Link που ανοίγει συνομιλία WhatsApp με προσυμπληρωμένο μήνυμα. */
export function whatsappHref(text?: string): string {
  const number = CONTACT.whatsappE164.replace(/^\+/, "");
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Deep link Viber (δουλεύει όπου είναι εγκατεστημένο το Viber). */
export function viberHref(): string {
  return `viber://chat?number=${encodeURIComponent(CONTACT.viberE164)}`;
}
