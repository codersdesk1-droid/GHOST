import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { categories, slugify, type Category, type Product } from "@/data/products";
import { db } from "@/prisma/db";
import { getImages } from "./images";

/** Stock keyed by `${color}|${size}`. */
export type StockMap = Record<string, number>;
/** A product photo; `color` null means it shows for every colour. */
export type Photo = { url: string; color: string | null; alt: string };
export type CatalogProduct = Product & { id: number; stock: StockMap; photos: Photo[] };

export const CATALOG_TAG = "catalog";
export const stockKey = (color: string, size: string) => `${color}|${size}`;

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const isCategory = (c: string): c is Category => categories.some((x) => x.id === c);

/** Photos dropped into public/products/<slug>/ before uploads existed. */
async function folderPhotos(slug: string, colors: string[]): Promise<Photo[]> {
  const urls = await getImages(`products/${slug}`);
  return urls.map((url) => {
    const file = decodeURIComponent(url.slice(url.lastIndexOf("/") + 1)).toLowerCase();
    return { url, color: colors.find((c) => file.startsWith(slugify(c))) ?? null, alt: "" };
  });
}

/**
 * The live catalog, entirely from the database (everything is editable in /admin).
 * Admin edits and paid orders revalidate the tag.
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");

  const rows = await db.orm.public.Product.where({ active: true })
    .include("variants", (v) => v.select("color", "size", "stock"))
    .include("colors", (c) => c.orderBy((x) => x.position.asc()))
    .include("meters", (m) => m.orderBy((x) => x.position.asc()))
    .include("images", (i) => i.orderBy((x) => x.position.asc()))
    .orderBy((p) => p.position.asc())
    .all();

  return Promise.all(
    rows.map(async (row) => {
      const stock: StockMap = {};
      for (const v of row.variants) stock[stockKey(v.color, v.size)] = v.stock;
      const colors = row.colors.map((c) => ({ name: c.name, hex: c.hex }));
      const photos: Photo[] = row.images.length
        ? row.images.map((i) => ({ url: i.url, color: i.color, alt: i.alt }))
        : await folderPhotos(row.slug, colors.map((c) => c.name));
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        category: isCategory(row.category) ? row.category : "tees",
        price: row.priceCents / 100,
        compareAt: row.compareAtCents != null ? row.compareAtCents / 100 : undefined,
        badge: (row.badge ?? undefined) as Product["badge"],
        tagline: row.tagline,
        description: row.description,
        colors: colors.length ? colors : [{ name: "Default", hex: "#1d2122" }],
        sizes: row.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        fabric: row.fabric,
        gsm: row.gsm,
        fit: row.fit,
        meters: row.meters.map((m) => ({ label: m.label, value: m.value, note: m.note })),
        details: lines(row.details),
        care: lines(row.care),
        stock,
        photos,
      } satisfies CatalogProduct;
    }),
  );
}

export async function getCatalogProduct(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug);
}

/** slug → photo URLs, for cards and bag thumbnails. */
export function photoMap(products: CatalogProduct[]) {
  return Object.fromEntries(products.map((p) => [p.slug, p.photos.map((ph) => ph.url)])) as Record<string, string[]>;
}
