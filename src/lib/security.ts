import "server-only";
import { createHash } from "node:crypto";

/**
 * The public host of this project's own Vercel Blob store, derived from its token
 * (vercel_blob_rw_<storeId>_<secret>). Only photos on this host are accepted.
 */
export function blobHost(): string | null {
  const id = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/)?.[1];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

export function isOwnBlobUrl(url: string) {
  const host = blobHost();
  try {
    const u = new URL(url);
    return !!host && u.protocol === "https:" && u.hostname === host;
  } catch {
    return false;
  }
}

/**
 * A stable, anonymous key for the caller: a hash of their IP, never the IP itself.
 * On Vercel the platform sets x-forwarded-for, so clients can't spoof it.
 */
export function clientKey(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`ghost-rl:${ip}`).digest("hex").slice(0, 24);
}

/**
 * Same-origin check for JSON endpoints called from our own pages. Browsers always
 * send Origin on cross-site POSTs, so a mismatch means another site is calling us.
 */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}
