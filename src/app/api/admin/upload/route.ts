import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getRole } from "@/lib/auth";

/**
 * Issues short-lived upload tokens so admin photos go straight from the browser
 * to Vercel Blob (no 4.5 MB function limit). Only owners and staff get a token.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
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
