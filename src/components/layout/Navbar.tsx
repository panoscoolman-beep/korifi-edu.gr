import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1.5 font-semibold tracking-tight">
          <span className="text-xl text-brand-700">Κορυφή</span>
          <span className="hidden text-xs text-slate-500 sm:inline">edu.gr</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/courses">Μαθήματα</NavLink>
          <NavLink href="/gia-emas">Για εμάς</NavLink>
          <NavLink href="/login">
            <span className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700">
              Σύνδεση
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
