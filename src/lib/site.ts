/**
 * Στοιχεία επικοινωνίας της Κορυφής — μία πηγή για footer, κουμπί επικοινωνίας
 * και φόρμα. Αλλαγή εδώ = αλλαγή παντού.
 */
export const CONTACT = {
  address: "Καλλονή Λέσβου, ΤΚ 81107",
  phone: "22530 25080",
  phoneE164: "+302253025080",
  email: "frontistiriokorifh@gmail.com",
  /**
   * Ο αριθμός που απαντά σε WhatsApp και Viber. Αν αλλάξει (π.χ. WhatsApp
   * Business στο σταθερό), αλλάζει μόνο εδώ.
   */
  messagingE164: "+306941689194",
  messagingDisplay: "6941 689 194",
  instagram: "https://www.instagram.com/frontistiriakorifh/",
} as const;

export const DEFAULT_MESSAGE = "Γεια σας, ενδιαφέρομαι για μαθήματα στην Κορυφή.";

/** Link που ανοίγει συνομιλία WhatsApp με προσυμπληρωμένο μήνυμα. */
export function whatsappHref(text?: string): string {
  const number = CONTACT.messagingE164.replace(/^\+/, "");
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Deep link Viber (δουλεύει όπου είναι εγκατεστημένο το Viber). */
export function viberHref(): string {
  return `viber://chat?number=${encodeURIComponent(CONTACT.messagingE164)}`;
}
