import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Live korifi-edu.gr WordPress media (used during migration period; will move to Supabase Storage in phase 5)
      { protocol: "https", hostname: "korifi-edu.gr",   pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "i0.wp.com",       pathname: "/korifi-edu.gr/**" },
      // Supabase Storage public URLs
      { protocol: "https", hostname: "zasshnqnexnuzmplolnu.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
