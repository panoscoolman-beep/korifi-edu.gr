import { createServerClient } from "@supabase/ssr";

/**
 * Cookieless Supabase client for public/anonymous reads from Server Components.
 *
 * Use this for any public page that does NOT need user-aware data — it doesn't
 * call `cookies()`, so the page can be statically prerendered with ISR.
 *
 * Examples: /blog, /events, /[slug] public pages, homepage, gallery, courses listing.
 *
 * For routes that need the logged-in user (admin, dashboard, navbar auth state),
 * use `createClient()` from `./server` instead.
 */
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
