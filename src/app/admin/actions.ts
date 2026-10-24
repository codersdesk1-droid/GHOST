"use server";

import { updateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { db } from "@/prisma/db";
import { sendShippedEmail } from "@/lib/email";

export type ActionState = { ok?: string; error?: string };

export async function updateStock(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
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
  await requireStaff();
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
  if (status === "shipped" && !order.shippedEmailAt && order.email) {
    const sent = await sendShippedEmail(id).catch(() => false);
    return { ok: sent ? `Order updated. Shipping email sent to ${order.email}.` : "Order updated. The shipping email couldn't be sent (check email setup)." };
  }
  return { ok: "Order updated." };
}
