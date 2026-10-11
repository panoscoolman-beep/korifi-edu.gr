/**
 * Στοιχεία επικοινωνίας της Κορυφής — μία πηγή για footer, κουμπί επικοινωνίας
 * και φόρμα. Αλλαγή εδώ = αλλαγή παντού.
 */
export const CONTACT = {
  address: "Καλλονή Λέσβου, ΤΚ 81107",
  phone: "22530 25080",
  phoneE164: "+302253025080",
  email: "frontistiriokorifh@gmail.com",
  /** WhatsApp Business: στο σταθερό 22530 25080 (επιβεβαίωση Πάνου 3/10/2026). Viber δεν υπάρχει (Πάνος 4/10/2026). */
  whatsappE164: "+302253025080",
  instagram: "https://www.instagram.com/frontistiriakorifh/",
} as const;

export const DEFAULT_MESSAGE = "Γεια σας, ενδιαφέρομαι για μαθήματα στην Κορυφή.";

/** Link που ανοίγει συνομιλία WhatsApp με προσυμπληρωμένο μήνυμα. */
export function whatsappHref(text?: string): string {
  const number = CONTACT.whatsappE164.replace(/^\+/, "");
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

