import { clerkMiddleware } from "@clerk/nextjs/server";

// Must match next.config.ts: only this project's own Blob store.
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/)?.[1];
const blobOrigin = blobStoreId ? `https://${blobStoreId.toLowerCase()}.public.blob.vercel-storage.com` : null;

// Bare on purpose: every page, route handler and server action checks auth itself.
// Clerk adds a Content-Security-Policy that keeps its own sign-in working; we merge
// in the store's extra sources. Non-strict mode keeps pages cacheable (no per-request nonce).
export default clerkMiddleware({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:", "blob:", ...(blobOrigin ? [blobOrigin] : [])],
      // Photo uploads from /admin go to Vercel Blob's API
      "connect-src": ["'self'", "https://vercel.com", ...(blobOrigin ? [blobOrigin] : [])],
      "font-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
      "upgrade-insecure-requests": [],
    },
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
