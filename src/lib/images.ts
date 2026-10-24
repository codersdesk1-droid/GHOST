import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Lists photos in public/<folder>/, sorted by name.
 * Returns public URLs, or [] when the folder doesn't exist yet.
 * Uploaded photos live in Vercel Blob; this is the fallback for files in the repo.
 */
export async function getImages(folder: string): Promise<string[]> {
  "use cache";
  try {
    const dir = path.join(process.cwd(), "public", folder);
    const files = await readdir(dir);
    return files
      .filter((f) => IMAGE_EXT.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => `/${folder}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}
