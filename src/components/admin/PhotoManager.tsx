"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addPhoto, deletePhoto, movePhoto, updatePhoto } from "@/app/admin/products/actions";
import { slugify } from "@/data/products";

type Photo = { id: number; url: string; color: string | null; alt: string };

const field = "h-9 w-full rounded-lg border border-line bg-white/[0.03] px-2 text-xs outline-none focus:border-bone/40";
const small = "grid h-8 min-w-8 place-items-center rounded-full border border-line px-2 text-xs transition hover:border-bone/40 disabled:opacity-30";

/** Upload, tag, reorder and remove product photos. Files go straight from the browser to Vercel Blob. */
export default function PhotoManager({
  productId,
  slug,
  colors,
  photos,
}: {
  productId: number;
  slug: string;
  colors: string[];
  photos: Photo[];
}) {
  const router = useRouter();
  const [color, setColor] = useState<string>("");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    try {
      for (const [i, file] of list.entries()) {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn't an image.`);
        const safe = slugify(file.name.replace(/\.[^.]+$/, "")) || "photo";
        const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".jpg").toLowerCase();
        // The colour slug starts the file name, so the bag can match thumbnails to colours.
        const pathname = `products/${slug}/${color ? slugify(color) : "all"}-${safe}${ext}`;
        const blob = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          multipart: file.size > 8 * 1024 * 1024,
          onUploadProgress: (p) => setProgress(`Uploading ${i + 1} of ${list.length}: ${Math.round(p.percentage)}%`),
        });
        await addPhoto({ productId, url: blob.url, pathname: blob.pathname, color: color || null });
      }
      setProgress(null);
      router.refresh();
    } catch (e) {
      setProgress(null);
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  const run = (fn: () => Promise<unknown>) => start(async () => {
    await fn();
    router.refresh();
  });

  return (
    <div className="glass rounded-[24px] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xl">Photos</p>
          <p className="mt-1 text-xs text-mist">Portrait 4:5 looks best. The first photo is the main one. Shoppers swipe through the rest.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-mist">
            New photos are for
            <select value={color} onChange={(e) => setColor(e.target.value)} className={`${field} h-11 w-48 text-sm`}>
              <option value="">Every colour</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className={`inline-flex h-11 cursor-pointer items-center rounded-full bg-bone px-6 text-sm text-void transition hover:bg-white ${progress ? "pointer-events-none opacity-60" : ""}`}>
            {progress ? "Uploading…" : "Upload photos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      {(progress || error) && (
        <p role="status" className={`mt-3 text-sm ${error ? "text-[#e8b4a0]" : "text-mist"}`}>{error ?? progress}</p>
      )}

      {photos.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mist">
          No photos yet. The store shows a drawn placeholder until you add some.
        </p>
      ) : (
        <ul className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {photos.map((ph, i) => (
            <li key={ph.id} className="rounded-2xl border border-line p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-smoke">
                <Image src={ph.url} alt={ph.alt || "Product photo"} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-bone px-2 py-0.5 text-[0.6rem] tracking-wider text-void uppercase">Main</span>}
              </div>
              <select
                value={ph.color ?? ""}
                aria-label="Photo colour"
                onChange={(e) => run(() => updatePhoto({ id: ph.id, color: e.target.value || null, alt: ph.alt }))}
                className={`${field} mt-2`}
              >
                <option value="">Every colour</option>
                {colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                defaultValue={ph.alt}
                placeholder="Describe the photo"
                aria-label="Photo description for screen readers"
                onBlur={(e) => e.target.value !== ph.alt && run(() => updatePhoto({ id: ph.id, color: ph.color, alt: e.target.value }))}
                className={`${field} mt-2`}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="flex gap-1">
                  <button type="button" className={small} disabled={i === 0} onClick={() => run(() => movePhoto({ id: ph.id, dir: -1 }))} aria-label="Move earlier">←</button>
                  <button type="button" className={small} disabled={i === photos.length - 1} onClick={() => run(() => movePhoto({ id: ph.id, dir: 1 }))} aria-label="Move later">→</button>
                </span>
                <button
                  type="button"
                  className={`${small} hover:border-[#e8b4a0]/60 hover:text-[#e8b4a0]`}
                  onClick={() => confirm("Delete this photo?") && run(() => deletePhoto({ id: ph.id }))}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
