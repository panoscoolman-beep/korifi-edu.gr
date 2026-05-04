import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const interSans = Inter({
  variable: "--font-sans-family",
  subsets: ["latin", "greek"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://korifi-edu.gr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Κορυφή — Φροντιστήριο Μέσης Εκπαίδευσης στην Καλλονή Λέσβου",
    template: "%s | Φροντιστήριο Κορυφή",
  },
  description:
    "Φροντιστήριο Μέσης Εκπαίδευσης Κορυφή στην Καλλονή Λέσβου. Γυμνάσιο, Λύκειο, ΕΠΑΛ, Πανελλήνιες — μικρά τμήματα έως 5 μαθητές, υβριδική διδασκαλία, αποτελέσματα.",
  applicationName: "Κορυφή",
  keywords: [
    "φροντιστήριο", "Καλλονή", "Λέσβος", "Πανελλήνιες", "Γυμνάσιο",
    "Λύκειο", "ΕΠΑΛ", "online μαθήματα", "Κορυφή", "korifi",
  ],
  authors: [{ name: "Φροντιστήριο Κορυφή" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: SITE_URL,
    siteName: "Φροντιστήριο Κορυφή",
    title: "Κορυφή — Φροντιστήριο Μέσης Εκπαίδευσης στην Καλλονή Λέσβου",
    description:
      "Μικρά τμήματα έως 5 μαθητές, υβριδική διδασκαλία, αποτελέσματα στις Πανελλήνιες. Από το 2019 στην Καλλονή Λέσβου.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Φροντιστήριο Κορυφή — Καλλονή Λέσβου",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Κορυφή — Φροντιστήριο Μέσης Εκπαίδευσης",
    description:
      "Μικρά τμήματα, υβριδική διδασκαλία, αποτελέσματα στις Πανελλήνιες — Καλλονή Λέσβου.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${interSans.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
