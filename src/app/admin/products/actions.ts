"use server";

import { del } from "@vercel/blob";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories, slugify } from "@/data/products";
import type { ActionState } from "@/app/admin/actions";
import { requireStaff } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { db } from "@/prisma/db";

const BADGES = ["New", "Best seller", "Limited"];
const HEX = /^#[0-9a-f]{6}$/i;

type ColorInput = { name: string; hex: string };
type MeterInput = { label: string; value: number; note: string };

function cents(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

function json<T>(value: FormDataEntryValue | null): T | null {
  try {
    return JSON.parse(String(value ?? "")) as T;
  } catch {
    return null;
  }
}

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);

/** Create or edit a product, then keep its colour × size variants in step. */
export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const id = form.get("id") ? Number(form.get("id")) : null;
  const name = text(form, "name", 80);
  const slug = slugify(text(form, "slug", 80) || name);
  const category = text(form, "category", 20);
  const priceCents = cents(form.get("price"));
  const compareAtCents = cents(form.get("compareAt"));
  const badge = text(form, "badge", 20);
  const gsm = Number(form.get("gsm") || 0);
  const sizes = [...new Set(text(form, "sizes", 200).split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))];
  const colors = (json<ColorInput[]>(form.get("colors")) ?? [])
    .map((c) => ({ name: String(c.name ?? "").trim().slice(0, 40), hex: String(c.hex ?? "") }))
    .filter((c) => c.name);
  const meters = (json<MeterInput[]>(form.get("meters")) ?? [])
    .map((m) => ({ label: String(m.label ?? "").trim().slice(0, 30), value: Number(m.value), note: String(m.note ?? "").trim().slice(0, 120) }))
    .filter((m) => m.label);

  if (!name) return { error: "Give the product a name." };
  if (!slug) return { error: "The web address needs letters or numbers." };
  if (!categories.some((c) => c.id === category)) return { error: "Pick a category." };
  if (priceCents === null || Number.isNaN(priceCents) || priceCents < 100) return { error: "Price must be at least $1." };
  if (Number.isNaN(compareAtCents)) return { error: "The 'was' price must be a number." };
  if (compareAtCents !== null && compareAtCents <= priceCents) return { error: "The 'was' price must be higher than the price." };
  if (badge && !BADGES.includes(badge)) return { error: "Unknown badge." };
  if (!Number.isInteger(gsm) || gsm < 0 || gsm > 2000) return { error: "GSM must be a whole number." };
  if (sizes.length === 0) return { error: "Add at least one size, e.g. S, M, L." };
  if (colors.length === 0) return { error: "Add at least one colour." };
  if (new Set(colors.map((c) => c.name.toLowerCase())).size !== colors.length) return { error: "Two colours have the same name." };
  if (colors.some((c) => !HEX.test(c.hex))) return { error: "Every colour needs a swatch colour." };
  if (meters.some((m) => !Number.isInteger(m.value) || m.value < 0 || m.value > 4)) return { error: "Ratings go from 0 to 4." };

  const clash = await db.orm.public.Product.first({ slug });
  if (clash && clash.id !== id) return { error: `Another product already uses the address /product/${slug}.` };

  const fields = {
    name,
    slug,
    category,
    priceCents,
    compareAtCents,
    badge: badge || null,
    active: form.get("active") === "on",
    tagline: text(form, "tagline", 160),
    description: text(form, "description", 2000),
    fabric: text(form, "fabric", 120),
    gsm,
    fit: text(form, "fit", 120),
    details: text(form, "details", 2000),
    care: text(form, "care", 1000),
    sizes: sizes.join(","),
  };

  const productId = await db.transaction(async (tx) => {
    let pid = id;
    if (pid === null) {
      const last = await tx.orm.public.Product.orderBy((p) => p.position.desc()).first();
      pid = (await tx.orm.public.Product.create({ ...fields, position: (last?.position ?? 0) + 1 })).id;
    } else {
      const updated = await tx.orm.public.Product.where({ id: pid }).update(fields);
      if (!updated) throw new Error("missing");
    }

    await tx.orm.public.ProductColor.where({ productId: pid }).deleteAll();
    for (const [i, c] of colors.entries()) await tx.orm.public.ProductColor.create({ productId: pid, ...c, position: i });
    await tx.orm.public.ProductMeter.where({ productId: pid }).deleteAll();
    for (const [i, m] of meters.entries()) await tx.orm.public.ProductMeter.create({ productId: pid, ...m, position: i });

    // Variants: add new colour × size combinations at 0 stock, remove ones no longer offered.
    const wanted = new Set(colors.flatMap((c) => sizes.map((s) => `${c.name}|${s}`)));
    const existing = await tx.orm.public.Variant.where({ productId: pid }).all();
    for (const v of existing) {
      if (!wanted.has(`${v.color}|${v.size}`)) await tx.orm.public.Variant.where({ id: v.id }).delete();
    }
    const have = new Set(existing.map((v) => `${v.color}|${v.size}`));
    for (const c of colors) {
      for (const size of sizes) {
        if (have.has(`${c.name}|${size}`)) continue;
        await tx.orm.public.Variant.create({
          productId: pid,
          color: c.name,
          size,
          sku: `GH-${pid}-${slugify(c.name).toUpperCase()}-${slugify(size).toUpperCase()}`,
          stock: 0,
        });
      }
    }
    // Photos tagged with a colour that was removed now show for every colour.
    const names = new Set(colors.map((c) => c.name));
    const photos = await tx.orm.public.ProductImage.where({ productId: pid }).all();
    for (const ph of photos) {
      if (ph.color && !names.has(ph.color)) await tx.orm.public.ProductImage.where({ id: ph.id }).update({ color: null });
    }
    return pid;
  }).catch((e) => {
    console.error("saveProduct failed", e);
    return null;
  });

  if (productId === null) return { error: "Couldn't save. The product may have been removed." };
  updateTag(CATALOG_TAG);
  if (id === null) redirect(`/admin/products/${productId}?created=1`);
  return { ok: "Saved. It's live on the store." };
}

/** Record a photo that the browser just uploaded to Blob. */
export async function addPhoto(input: { productId: number; url: string; pathname: string; color: string | null }) {
  await requireStaff();
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(input.url)) throw new Error("Not a store photo URL");
  const last = await db.orm.public.ProductImage.where({ productId: input.productId }).orderBy((i) => i.position.desc()).first();
  await db.orm.public.ProductImage.create({
    productId: input.productId,
    url: input.url,
    pathname: input.pathname,
    color: input.color || null,
    alt: "",
    position: (last?.position ?? -1) + 1,
  });
  updateTag(CATALOG_TAG);
}

export async function updatePhoto(input: { id: number; color: string | null; alt: string }) {
  await requireStaff();
  await db.orm.public.ProductImage.where({ id: input.id }).update({ color: input.color || null, alt: input.alt.slice(0, 160) });
  updateTag(CATALOG_TAG);
}

/** Move a photo one place earlier (-1) or later (+1). */
export async function movePhoto(input: { id: number; dir: -1 | 1 }) {
  await requireStaff();
  const photo = await db.orm.public.ProductImage.first({ id: input.id });
  if (!photo) return;
  const all = await db.orm.public.ProductImage.where({ productId: photo.productId }).orderBy((i) => i.position.asc()).all();
  const from = all.findIndex((p) => p.id === photo.id);
  const to = from + input.dir;
  if (to < 0 || to >= all.length) return;
  [all[from], all[to]] = [all[to], all[from]];
  await db.transaction(async (tx) => {
    for (const [i, p] of all.entries()) await tx.orm.public.ProductImage.where({ id: p.id }).update({ position: i });
  });
  updateTag(CATALOG_TAG);
}

export async function deletePhoto(input: { id: number }) {
  await requireStaff();
  const photo = await db.orm.public.ProductImage.first({ id: input.id });
  if (!photo) return;
  await db.orm.public.ProductImage.where({ id: photo.id }).delete();
  await del(photo.url).catch(() => {}); // the database row is what the store reads; a leftover file is harmless
  updateTag(CATALOG_TAG);
}
