import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="" width={32} height={62} className="h-8 w-auto" />
            <p className="text-lg font-semibold text-brand-700">Κορυφή</p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-600">
            Φροντιστήριο μέσης εκπαίδευσης. Μαθήματα και υλικό για γυμνάσιο και λύκειο.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-slate-900">Πλοήγηση</p>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><Link href="/" className="hover:text-brand-700">Αρχική</Link></li>
            <li><Link href="/courses" className="hover:text-brand-700">Μαθήματα</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Σύνδεση</Link></li>
          </ul>
        </div>

        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-900">Επικοινωνία</p>
          <p className="mt-2">korifi-edu.gr</p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
        © {year} Κορυφή. Με επιφύλαξη παντός δικαιώματος.
      </div>
    </footer>
  );
}
