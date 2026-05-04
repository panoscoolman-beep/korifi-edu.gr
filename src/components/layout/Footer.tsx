import Image from "next/image";
import { ResourcesStrip } from "./ResourcesStrip";

const CONTACT = {
  address: "Καλλονή Λέσβου, ΤΚ 81107",
  phone:   "22530 25080",
  phoneHref: "tel:+302253025080",
  email:   "frontistiriokorifh@gmail.com",
  emailHref: "mailto:frontistiriokorifh@gmail.com",
};

const SOCIAL = {
  instagram: "https://www.instagram.com/frontistiriakorifh/",
  facebook:  "https://www.facebook.com/frontistiriokorifh",
  // Σωστό place link (από Google Maps share)
  google:    "https://maps.app.goo.gl/G3P3Bc8ync7s9arc8",
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <ResourcesStrip />

      <footer className="bg-[#1f3a5f] text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-3">
          {/* Επικοινωνία */}
          <div>
            <h3 className="text-lg font-semibold text-amber-300">Επικοινωνία</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>{CONTACT.address}</li>
              <li>
                <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 hover:text-amber-300">
                  <span className="text-pink-400">📞</span>
                  <span>{CONTACT.phone}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="inline-flex items-center gap-2 hover:text-amber-300">
                  <span className="text-pink-400">✉️</span>
                  <span>{CONTACT.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Κορυφή */}
          <div>
            <h3 className="text-lg font-semibold text-amber-300">Κορυφή</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p>Φροντιστήριο Μέσης Εκπαίδευσης στην Καλλονή Λέσβου από το 2019.</p>
              <p>Γυμνάσιο · Λύκειο · ΕΠΑΛ · Πανελλήνιες</p>
              <p className="italic text-slate-300">Στοχεύοντας ψηλά. Φτάνοντας στην <em>Κορυφή</em>.</p>
            </div>
          </div>

          {/* Ακολούθησέ μας */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-amber-300">Ακολούθησέ μας</h3>
            <ul className="mt-4 flex items-center gap-3">
              <li>
                <a
                  href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-100 transition-colors hover:bg-amber-300 hover:text-slate-900"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.63a5.86 5.86 0 0 0-2.13 1.39 5.86 5.86 0 0 0-1.39 2.13C.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.29 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.56a5.86 5.86 0 0 0 2.13-1.39 5.86 5.86 0 0 0 1.39-2.13c.29-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.56-2.91a5.86 5.86 0 0 0-1.39-2.13A5.86 5.86 0 0 0 19.86.63c-.76-.29-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-100 transition-colors hover:bg-amber-300 hover:text-slate-900"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.google} target="_blank" rel="noopener noreferrer"
                  aria-label="Google Maps"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-100 transition-colors hover:bg-amber-300 hover:text-slate-900"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                  </svg>
                </a>
              </li>
            </ul>

            <div className="mt-8 flex w-full justify-center opacity-90">
              <Image
                src="/logo-tagline.png" alt="Φροντιστήριο Κορυφή — Στοχεύοντας ψηλά, φτάνοντας στην Κορυφή"
                width={1920} height={669}
                className="h-20 w-auto sm:h-24"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          © {year} Φροντιστήριο Κορυφή — Καλλονή Λέσβου · Με επιφύλαξη παντός δικαιώματος.
        </div>
      </footer>
    </>
  );
}
