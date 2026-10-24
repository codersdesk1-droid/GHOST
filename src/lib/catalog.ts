import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as editorial, type Product } from "@/data/products";
import { db } from "@/prisma/db";

/** Stock keyed by `${color}|${size}`. */
export type StockMap = Record<string, number>;
export type CatalogProduct = Product & { stock: StockMap };

export const CATALOG_TAG = "catalog";
export const stockKey = (color: string, size: string) => `${color}|${size}`;

/**
 * The live catalog: copy from src/data/products.ts, with name, prices, badge,
 * visibility and stock from the database. Admin edits revalidate the tag.
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");

  const rows = await db.orm.public.Product.include("variants", (v) => v.select("color", "size", "stock")).all();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  return editorial.flatMap((p) => {
    const row = bySlug.get(p.slug);
    if (!row || !row.active) return [];
    const stock: StockMap = {};
    for (const v of row.variants) stock[stockKey(v.color, v.size)] = v.stock;
    return [
      {
        ...p,
        name: row.name,
        price: row.priceCents / 100,
        compareAt: row.compareAtCents != null ? row.compareAtCents / 100 : undefined,
        badge: (row.badge ?? undefined) as Product["badge"],
        stock,
      },
    ];
  });
}

export async function getCatalogProduct(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug);
}
