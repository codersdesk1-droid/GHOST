import type { NextConfig } from "next";

// Only this project's own Blob store may feed the image optimizer (anyone else's images
// would run on our bill). The host comes from the store token: vercel_blob_rw_<id>_<secret>.
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/)?.[1];
const blobHost = blobStoreId ? `${blobStoreId.toLowerCase()}.public.blob.vercel-storage.com` : undefined;

// Content-Security-Policy is added per request by Clerk's middleware (src/proxy.ts).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: blobHost ? [{ protocol: "https", hostname: blobHost }] : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin, account and API responses are private: never cache or index them.
      {
        source: "/(admin|account|api)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
