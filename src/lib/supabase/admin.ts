import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — ΠΑΡΑΚΑΜΠΤΕΙ το RLS. Μόνο server-side, και μόνο για:
 *   - μετρήσεις/μεταδεδομένα που δεν αποκαλύπτουν κλειδωμένο περιεχόμενο
 *     (π.χ. «πόσες ενότητες έχει ένα μάθημα»),
 *   - signed URLs του ιδιωτικού bucket `pdfs`, ΑΦΟΥ ο χρήστης έχει περάσει
 *     τον έλεγχο πρόσβασης με τον δικό του (RLS) client.
 * Ποτέ για να επιστρέψεις περιεχόμενο μαθήματος σε χρήστη.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
