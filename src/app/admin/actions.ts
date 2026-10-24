"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { db } from "@/prisma/db";

export type ActionState = { ok?: string; error?: string };

const BADGES = ["New", "Best seller", "Limited"] as const;

function toCents(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN;
}

export async function updateProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  const priceCents = toCents(form.get("price"));
  const compareAtCents = toCents(form.get("compareAt"));
  const badge = String(form.get("badge") ?? "");
  const active = form.get("active") === "on";

  if (!Number.isInteger(id)) return { error: "Unknown product." };
  if (!name || name.length > 80) return { error: "Name needs 1 to 80 characters." };
  if (priceCents === null || Number.isNaN(priceCents) || priceCents < 100) return { error: "Price must be at least $1." };
  if (Number.isNaN(compareAtCents)) return { error: "Sale 'was' price must be a number." };
  if (compareAtCents !== null && compareAtCents <= priceCents) return { error: "The 'was' price must be higher than the price." };
  if (badge && !(BADGES as readonly string[]).includes(badge)) return { error: "Unknown badge." };

  await db.orm.public.Product.where({ id }).update({
    name,
    priceCents,
    compareAtCents,
    badge: badge || null,
    active,
  });
  updateTag(CATALOG_TAG);
  return { ok: "Saved." };
}

export async function updateStock(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const productId = Number(form.get("productId"));
  if (!Number.isInteger(productId)) return { error: "Unknown product." };

  const variants = await db.orm.public.Variant.where({ productId }).select("id", "stock").all();
  let changed = 0;
  await db.transaction(async (tx) => {
    for (const v of variants) {
      const raw = form.get(`stock-${v.id}`);
      if (raw === null) continue;
      const stock = Number(raw);
      if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) throw new Error("bad stock");
      if (stock !== v.stock) {
        await tx.orm.public.Variant.where({ id: v.id }).update({ stock });
        changed++;
      }
    }
  }).catch(() => {
    changed = -1;
  });
  if (changed < 0) return { error: "Stock must be whole numbers, 0 or more." };
  updateTag(CATALOG_TAG);
  return { ok: changed ? `Updated ${changed} size${changed > 1 ? "s" : ""}.` : "No changes." };
}

export async function updateOrder(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "") as OrderStatus;
  const trackingNumber = String(form.get("trackingNumber") ?? "").trim();

  if (!Number.isInteger(id)) return { error: "Unknown order." };
  if (!ORDER_STATUSES.includes(status)) return { error: "Unknown status." };
  if (trackingNumber.length > 80) return { error: "Tracking number is too long." };

  const order = await db.orm.public.Order.first({ id });
  if (!order) return { error: "Unknown order." };
  // Payment state belongs to Stripe: an unpaid order can't be marked as paid or shipped here.
  if (order.status === "pending" && status !== "pending" && status !== "cancelled") {
    return { error: "This order hasn't been paid yet." };
  }

  await db.orm.public.Order.where({ id }).update({ status, trackingNumber: trackingNumber || null });
  return { ok: "Order updated." };
}
