import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getRole } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientKey, isSameOrigin } from "@/lib/security";

/**
 * Issues short-lived upload tokens so admin photos go straight from the browser
 * to Vercel Blob (no 4.5 MB function limit). Only owners and staff get a token.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const limited = await rateLimit("upload", clientKey(request.headers), { limit: 60, windowSeconds: 60 });
  if (!limited.ok) return tooManyRequests(limited.retryAfter);
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return Response.json({ error: "Bad request" }, { status: 400 });
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getRole())) throw new Error("Not allowed");
        if (!pathname.startsWith("products/")) throw new Error("Bad path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}
