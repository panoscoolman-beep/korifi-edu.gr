# korifi-edu.gr

Educational platform for secondary school students (φροντιστήρια μέσης εκπαίδευσης).

## Stack

- **Frontend + API:** Next.js 15 (App Router)
- **Database + Auth + Storage:** Supabase
- **Deploy:** Vercel

## Development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Environment

Copy `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Branching

- `main` — production-ready code only
- `feature/<name>` — one branch per feature, merged via PR

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
