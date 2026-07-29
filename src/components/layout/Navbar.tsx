import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublishedAlbums } from "@/lib/queries";
import { MobileMenu } from "./MobileMenu";
import { NavDropdown, AccountMenu } from "./NavMenus";

const PROGRAM_LINKS = [
  { href: "/gimnasio", label: "Γυμνάσιο" },
  { href: "/alikeiou", label: "Α' Λυκείου" },
  { href: "/blikeiou", label: "Β' Λυκείου" },
  { href: "/glikeiou", label: "Γ' Λυκείου & Πανελλήνιες" },
  { href: "/epal",     label: "ΕΠΑΛ" },
];

const MORE_LINKS = [
  { href: "/events",     label: "Εκδηλώσεις" },
  { href: "/gallery",    label: "Φωτογραφίες" },
  { href: "/martyries",  label: "Μαρτυρίες" },
  { href: "/synergates", label: "Συνεργάτες" },
  { href: "/frontistirio-lesvos", label: "Φροντιστήριο στη Λέσβο" },
];

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
  }

  // Hide the "Φωτογραφίες" link until at least one album is published — avoids
  // sending visitors to an empty page. (Cached query, tag: gallery_albums.)
  const hasGallery = (await getPublishedAlbums()).length > 0;
  const moreLinks = hasGallery ? MORE_LINKS : MORE_LINKS.filter((l) => l.href !== "/gallery");

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1f3a5f] text-slate-100 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-90"
          aria-label="Κορυφή — αρχική"
        >
          <Image
            src="/logo.png"
            alt="Κορυφή"
            width={511}
            height={135}
            priority
            className="h-9 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>

        <nav className="flex items-center gap-0.5">
          <NavDropdown label="Πρόγραμμα Σπουδών" links={PROGRAM_LINKS} />
          <NavLink href="/online-mathimata">Online μαθήματα</NavLink>
          <NavLink href="/courses">Μαθήματα</NavLink>
          <NavLink href="/epaggelmatikos-prosanatolismos">Προσανατολισμός</NavLink>
          <NavLink href="/ergaleia">Εργαλεία</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/gia-emas">Για εμάς</NavLink>
          <NavLink href="/epikoinonia">Επικοινωνία</NavLink>
          <NavDropdown label="Περισσότερα" links={moreLinks} align="right" />

          {user ? (
            <AccountMenu email={user.email ?? ""} role={role} />
          ) : (
            <Link
              href="/login"
              className="ml-2 hidden rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400 lg:inline-block"
            >
              Σύνδεση
            </Link>
          )}

          <MobileMenu user={user ? { email: user.email ?? "" } : null} role={role} hasGallery={hasGallery} />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden rounded-md px-2.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-amber-300 lg:inline-block"
    >
      {children}
    </Link>
  );
}
