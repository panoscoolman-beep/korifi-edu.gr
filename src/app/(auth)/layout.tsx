import type { Metadata } from "next";

/**
 * Auth pages (login/register/forgot-password) — δεν πρέπει να εμφανίζονται
 * στα αποτελέσματα αναζήτησης. Το robots.txt disallow ΔΕΝ αρκεί από μόνο του:
 * η Google μπορεί να δείξει ένα URL χωρίς να το crawl-άρει αν δεν δει noindex.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
