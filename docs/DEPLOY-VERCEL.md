# Vercel Deployment — korifi-edu.gr

## TL;DR

1. Login Vercel → New Project → Import this GitHub repo (`panoscoolman-beep/korifi-edu.gr`)
2. Set the env vars below
3. Deploy
4. Update Supabase + Google OAuth callback URLs με το νέο domain
5. Test login flows end-to-end

---

## 1. Environment variables (set on Vercel project)

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zasshnqnexnuzmplolnu.supabase.co` | Public — same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (από `.env.local`) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | (από `.env.local`) | **Secret** — never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | `https://korifi-edu.gr` (production) `https://korifi-edu-preview.vercel.app` (preview) | Used by sitemap.ts + JSON-LD |

Στο Vercel UI: **Settings → Environment Variables**, δηλώνεις σε ποια environment ισχύει το καθένα (Production / Preview / Development).

---

## 2. Build & runtime settings

Vercel auto-detects Next.js — δεν χρειάζεται `vercel.json`. Defaults:
- Framework Preset: **Next.js**
- Build Command: `next build` (auto)
- Output Directory: `.next` (auto)
- Install Command: `npm install` (auto)
- Node Version: 20.x (auto από engines στο package.json)

Αν θες να σπάσεις cache του CDN ξεχωριστά για ένα route, χρησιμοποίησε `revalidatePath()` / `updateTag()` από server actions — η Vercel τα προωθεί στο edge cache.

---

## 3. OAuth callback URLs που πρέπει να αλλάξουν

### Google Cloud Console
- Πήγαινε στο [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
- Άνοιξε το OAuth 2.0 Client (`512604453780-...`)
- **Authorized redirect URIs** — πρόσθεσε:
  - `https://zasshnqnexnuzmplolnu.supabase.co/auth/v1/callback`
  - (το production domain σου, αν διαφέρει)
- **Authorized JavaScript origins** — πρόσθεσε:
  - `https://korifi-edu.gr`
  - `https://your-preview.vercel.app` (ένα οποιοδήποτε preview URL που χρησιμοποιείς για testing)

### Supabase Dashboard
- Project Settings → Authentication → URL Configuration
- **Site URL**: `https://korifi-edu.gr`
- **Redirect URLs** (whitelist): πρόσθεσε όλα τα preview domains που θες να λειτουργεί το auth — π.χ. `https://*.vercel.app`, `https://korifi-edu.gr/**`
- Email templates: αν έχεις custom, βεβαιώσου ότι το `{{ .SiteURL }}` δείχνει στο σωστό domain

---

## 4. Custom domain `korifi-edu.gr`

1. Στο Vercel project → Settings → Domains → Add `korifi-edu.gr` και `www.korifi-edu.gr`
2. Vercel θα σου δώσει DNS records (A ή CNAME)
3. Ενημέρωσε τα DNS records στον domain registrar
4. Set redirect: `www → @` (στο Vercel) ή το αντίστροφο, ό,τι προτιμάς
5. Στο `NEXT_PUBLIC_SITE_URL` ενημέρωσε στο production env

---

## 5. Pre-launch checklist

- [ ] Όλες οι env vars set σε production
- [ ] Google OAuth redirect URIs ενημερωμένα
- [ ] Supabase redirect URL whitelist ενημερωμένο
- [ ] Custom domain working με HTTPS
- [ ] Login flow τέσταρμένο (Google + email)
- [ ] Admin URL τέσταρμένο (login → dashboard → admin)
- [ ] `/sitemap.xml` accessible και έχει σωστό domain
- [ ] `/robots.txt` accessible
- [ ] Open Graph/SEO meta tags ορατά (δες με curl ή [opengraph.xyz](https://www.opengraph.xyz/))
- [ ] Mobile menu λειτουργεί
- [ ] Όλα τα forms (epikoinonia, admin saves) λειτουργούν live
- [ ] Storage uploads (admin photo upload) λειτουργούν live

---

## 6. Backup pipeline

Το `scripts/backup/backup.py` θα συνεχίσει να τρέχει τοπικά (Windows Task Scheduler). Δεν πειράζεις τίποτα στο Vercel για αυτό. Backup zips ανεβαίνουν στο Google Drive όπως και πριν.

Αν θες backup από το Vercel deployment side, καλύτερα να κρατήσεις τον τοπικό runner — έχει ήδη rclone setup και το Drive folder σταθερό.
