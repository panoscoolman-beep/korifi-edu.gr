/**
 * Κανόνες κωδικού — ίδιοι με το Supabase Auth (`supabase/config.toml`:
 * minimum_password_length = 10, password_requirements = "lower_upper_letters_digits").
 * Επιστρέφει μήνυμα σφάλματος στα ελληνικά ή `null` αν ο κωδικός είναι αποδεκτός.
 */
export const PASSWORD_HINT = "Τουλάχιστον 10 χαρακτήρες, με πεζά, κεφαλαία και αριθμό.";
export function passwordProblem(password: string): string | null {
  if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return `Ο κωδικός δεν είναι αρκετά ισχυρός. ${PASSWORD_HINT}`;
  }
  return null;
}
