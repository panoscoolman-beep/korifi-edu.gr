import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

const PROGRAM_LINKS = [
  { href: "/gimnasio", label: "Γυμνάσιο" },
  { href: "/alikeiou", label: "Α' Λυκείου" },
  { href: "/blikeiou", label: "Β' Λυκείου" },
  { href: "/glikeiou", label: "Γ' Λυκείου & Πανελλήνιες" },
  { href: "/epal",     label: "ΕΠΑΛ" },
];

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Image src="/logo-icon.png" alt="Κορυφή" width={36} height={68} priority className="h-9 w-auto" />
          <span className="text-xl text-brand-700">Κορυφή</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <ProgramDropdown />
          <NavLink href="/courses">Μαθήματα</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/events">Εκδηλώσεις</NavLink>
          <NavLink href="/gia-emas">Για εμάς</NavLink>
          <NavLink href="/synergates">Συνεργάτες</NavLink>

          {user ? <UserMenu email={user.email ?? ""} role={role} /> : (
            <Link
              href="/login"
              className="ml-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Σύνδεση
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 md:inline-block"
    >
      {children}
    </Link>
  );
}

function ProgramDropdown() {
  return (
    <div className="group relative hidden md:block">
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        Πρόγραμμα Σπουδών
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        {PROGRAM_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function UserMenu({ email, role }: { email: string; role: string | null }) {
  return (
    <div className="group relative ml-1">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        aria-label="Ο λογαριασμός μου"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1.5c-2.4 0-7 1.2-7 3.5V14h14v-1c0-2.3-4.6-3.5-7-3.5z"/>
        </svg>
        <span className="hidden sm:inline">{email.split("@")[0]}</span>
      </button>
      <div className="invisible absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500">{email}</div>
        <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700">
          Ο λογαριασμός μου
        </Link>
        {role === "admin" && (
          <Link href="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700">
            Διαχείριση
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-700">
            Αποσύνδεση
          </button>
        </form>
      </div>
    </div>
  );
}
