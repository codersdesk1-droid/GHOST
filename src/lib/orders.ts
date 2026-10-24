import "server-only";
import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { db } from "@/prisma/db";
import { getSettings } from "./settings";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "needs_attention",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CheckoutLine = { slug: string; color: string; size: string; qty: number };

export class CheckoutError extends Error {}

export function newOrderNumber() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
  const bytes = randomBytes(7);
  return "GH-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Prices, stock and totals come from the database, never from the browser.
 * Creates a pending order; stock is only taken once Stripe confirms payment.
 */
export async function createPendingOrder(lines: CheckoutLine[], customer: { clerkUserId?: string; email?: string }) {
  const slugs = [...new Set(lines.map((l) => l.slug))];
  const products = await db.orm.public.Product.where((p) => p.slug.in(slugs))
    .include("variants")
    .all();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items = lines.map((l) => {
    const p = bySlug.get(l.slug);
    if (!p || !p.active) throw new CheckoutError("One of the pieces in your bag is no longer available.");
    const v = p.variants.find((x) => x.color === l.color && x.size === l.size);
    if (!v) throw new CheckoutError(`${p.name} in ${l.color}, size ${l.size} doesn't exist.`);
    if (v.stock < l.qty) {
      throw new CheckoutError(
        v.stock === 0
          ? `${p.name} in ${l.color}, size ${l.size} just sold out.`
          : `Only ${v.stock} left of ${p.name} in ${l.color}, size ${l.size}.`,
      );
    }
    return {
      variantId: v.id,
      productSlug: p.slug,
      productName: p.name,
      color: v.color,
      size: v.size,
      sku: v.sku,
      unitPriceCents: p.priceCents,
      quantity: l.qty,
    };
  });

  const subtotalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  const settings = await getSettings();
  const shippingCents = subtotalCents >= settings.freeShippingCents ? 0 : settings.shippingCents;

  const order = await db.transaction(async (tx) => {
    const o = await tx.orm.public.Order.create({
      number: newOrderNumber(),
      clerkUserId: customer.clerkUserId ?? null,
      email: customer.email ?? null,
      status: "pending",
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      currency: "usd",
    });
    for (const item of items) await tx.orm.public.OrderItem.create({ ...item, orderId: o.id });
    return o;
  });

  return { order, items };
}

/**
 * Called from the Stripe webhook once a Checkout Session is paid. Idempotent: the
 * event id is recorded and the order row is locked, so a retried or duplicate
 * event can never take stock twice.
 */
export async function fulfilSession(eventId: string, eventType: string, session: Stripe.Checkout.Session) {
  let lastFulfilledOrderId: number | null = null;
  const result = await db.transaction(async (tx) => {
    if (await tx.orm.public.ProcessedEvent.first({ id: eventId })) return "duplicate-event";

    const order = await tx.orm.public.Order.where({ stripeSessionId: session.id }).forUpdate().first();
    if (!order) {
      await tx.orm.public.ProcessedEvent.create({ id: eventId, type: eventType });
      return "unknown-order";
    }
    if (order.status !== "pending") {
      await tx.orm.public.ProcessedEvent.create({ id: eventId, type: eventType });
      return "already-fulfilled";
    }

    const items = await tx.orm.public.OrderItem.where({ orderId: order.id }).all();
    let oversold = false;
    for (const item of items) {
      const variant = await tx.orm.public.Variant.where({ id: item.variantId }).forUpdate().first();
      if (!variant || variant.stock < item.quantity) {
        oversold = true;
        continue;
      }
      await tx.orm.public.Variant.where({ id: variant.id }).update({ stock: variant.stock - item.quantity });
    }

    const shipping = session.collected_information?.shipping_details;
    await tx.orm.public.Order.where({ id: order.id }).update({
      // Paid but stock ran out between checkout and payment: flag it for the admin.
      status: oversold ? "needs_attention" : "paid",
      email: session.customer_details?.email ?? order.email,
      shippingName: shipping?.name ?? session.customer_details?.name ?? null,
      shippingAddress: shipping?.address ? JSON.stringify(shipping.address) : null,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });
    await tx.orm.public.ProcessedEvent.create({ id: eventId, type: eventType });
    lastFulfilledOrderId = order.id;
    return oversold ? "needs-attention" : "paid";
  });
  return { result, orderId: lastFulfilledOrderId };
}

/** Expired or failed sessions release the pending order. Paid orders are never touched. */
export async function cancelSession(eventId: string, eventType: string, sessionId: string) {
  return db.transaction(async (tx) => {
    if (await tx.orm.public.ProcessedEvent.first({ id: eventId })) return;
    const order = await tx.orm.public.Order.where({ stripeSessionId: sessionId }).forUpdate().first();
    if (order?.status === "pending") {
      await tx.orm.public.Order.where({ id: order.id }).update({ status: "cancelled" });
    }
    await tx.orm.public.ProcessedEvent.create({ id: eventId, type: eventType });
  });
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
