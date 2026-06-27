import type { NextConfig } from "next";

// Security headers applied to every route. No full script-src CSP yet (the site
// uses inline JSON-LD, Vercel Analytics and a Google Maps iframe, so a strict
// content CSP needs per-page testing first) — but we lock down framing,
// MIME-sniffing, referrer leakage and feature access, and harden HSTS.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public URLs (articles, courses, hero, teachers, …)
      { protocol: "https", hostname: "zasshnqnexnuzmplolnu.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
