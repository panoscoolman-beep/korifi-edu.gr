# Google OAuth setup για Supabase (one-time)

**Σκοπός:** Να μπορούν οι μαθητές να συνδέονται με 1 κλικ μέσω Google στο `/login`. Χωρίς αυτό το setup, το κουμπί "Συνέχεια με Google" θα γυρίζει error.

## Βήμα 1 — Δημιουργία Google Cloud project (5 λεπτά)

1. Πήγαινε https://console.cloud.google.com/
2. Πάνω αριστερά: **Select a project** → **New Project**
3. **Name:** `korifi-edu` → Create

## Βήμα 2 — OAuth consent screen

1. Από το αριστερό menu: **APIs & Services** → **OAuth consent screen**
2. Επίλεξε **External** → Create
3. Συμπλήρωσε:
   - **App name:** `Κορυφή`
   - **User support email:** `info@korifi-edu.gr`
   - **Developer contact:** `panoscoolman@gmail.com`
4. **Scopes:** Save and Continue (default είναι ΟΚ)
5. **Test users:** πρόσθεσε `panoscoolman@gmail.com` και άλλα emails για test
6. Save

## Βήμα 3 — Credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. **Application type:** **Web application**
3. **Name:** `korifi-supabase`
4. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `https://zasshnqnexnuzmplolnu.supabase.co`
   - (αργότερα: `https://korifi-edu.gr`)
5. **Authorized redirect URIs:**
   - `https://zasshnqnexnuzmplolnu.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
6. Create → εμφανίζονται **Client ID** + **Client secret** → αντιγράψτα.

## Βήμα 4 — Πέρνα τα credentials στο Supabase

1. https://supabase.com/dashboard/project/zasshnqnexnuzmplolnu/auth/providers
2. **Google** → **Enable**
3. Paste το **Client ID** και **Client Secret**
4. Save

## Βήμα 5 — Email settings (verification)

1. https://supabase.com/dashboard/project/zasshnqnexnuzmplolnu/auth/sign-in
2. Κύλισε στα **Email signups**:
   - **Enable email confirmations:** ✅ ON (υποχρεωτική επιβεβαίωση email)
   - **Secure email change:** ✅ ON
3. Save

**Σημείωση για free tier:** Το Supabase στέλνει emails μέσω built-in SMTP με όριο **3 emails/ώρα ανά IP**. Για production συνιστάται custom SMTP (π.χ. Resend, SendGrid) — δωρεάν tier καλύπτει χιλιάδες emails. Για τώρα το default είναι ΟΚ.

## Βήμα 6 — Test

1. Restart dev server: `npm run dev`
2. Άνοιξε http://localhost:3000/login
3. **Test email signup:** /register → εισαγωγή στοιχείων → δες email επιβεβαίωσης → κλικ στον σύνδεσμο
4. **Test Google login:** /login → "Σύνδεση με Google" → επίλεξε Google account

Αν ολα δουλεύουν, μετά το πρώτο σου login με `panoscoolman@gmail.com` τρέξε στο Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'panoscoolman@gmail.com');
```

για να γίνεις admin και να δεις το **/admin** menu στο navbar.
