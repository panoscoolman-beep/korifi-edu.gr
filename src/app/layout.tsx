import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Κορυφή — Φροντιστήριο Μέσης Εκπαίδευσης",
    template: "%s | Κορυφή",
  },
  description:
    "E-learning πλατφόρμα του φροντιστηρίου Κορυφή — μαθήματα, σημειώσεις και υλικό για μαθητές γυμνασίου και λυκείου.",
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
      </body>
    </html>
  );
}
