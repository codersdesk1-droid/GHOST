import { auth, currentUser } from "@clerk/nextjs/server";
import { createPendingOrder, CheckoutError, type CheckoutLine } from "@/lib/orders";
import { rateLimitAll, tooManyRequests } from "@/lib/rate-limit";
import { clientKey, isSameOrigin } from "@/lib/security";
import { stripe } from "@/lib/stripe";
import { db } from "@/prisma/db";

const MAX_LINES = 20;
const MAX_BODY_BYTES = 16_000;
const SHIP_TO = ["US", "CA", "GB", "IE", "AU", "NZ", "IN", "DE", "FR", "NL", "SE", "DK", "JP", "SG", "AE"] as const;

function parseLines(body: unknown): CheckoutLine[] | null {
  const raw = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;
  const lines: CheckoutLine[] = [];
  for (const l of raw) {
    const { slug, color, size, qty } = (l ?? {}) as Record<string, unknown>;
    if (typeof slug !== "string" || typeof color !== "string" || typeof size !== "string") return null;
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > 10) return null;
    lines.push({ slug, color, size, qty: qty as number });
  }
  return lines;
}

export async function POST(req: Request) {
  // Only our own pages may start a checkout, and only with a small JSON body.
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!req.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Expected JSON" }, { status: 415 });
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Your bag is too big." }, { status: 413 });

  // Each checkout creates an order and a Stripe session, so cap how often one visitor can start one.
  const limited = await rateLimitAll("checkout", clientKey(req.headers), [
    { limit: 8, windowSeconds: 60 },
    { limit: 40, windowSeconds: 3600 },
  ]);
  if (!limited.ok) return tooManyRequests(limited.retryAfter);

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {}
  const lines = parseLines(body);
  if (!lines) return Response.json({ error: "Your bag looks off. Refresh and try again." }, { status: 400 });

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const email = user?.primaryEmailAddress?.emailAddress;

  try {
    const { order, items } = await createPendingOrder(lines, { clerkUserId: userId ?? undefined, email });
    const origin = new URL(req.url).origin;

    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        integration_identifier: "ghost-storefront-vkqrmhtd",
        client_reference_id: order.number,
        metadata: { orderId: String(order.id), orderNumber: order.number },
        customer_email: email,
        line_items: items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency: "usd",
            unit_amount: i.unitPriceCents,
            product_data: { name: i.productName, description: `${i.color} · Size ${i.size}` },
          },
        })),
        shipping_address_collection: { allowed_countries: [...SHIP_TO] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: order.shippingCents === 0 ? "Free shipping" : "Standard shipping",
              fixed_amount: { amount: order.shippingCents, currency: "usd" },
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 14 },
              },
            },
          },
        ],
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      },
      { idempotencyKey: `checkout-${order.number}` },
    );

    await db.orm.public.Order.where({ id: order.id }).update({ stripeSessionId: session.id });
    return Response.json({ url: session.url });
  } catch (e) {
    if (e instanceof CheckoutError) return Response.json({ error: e.message }, { status: 409 });
    console.error("checkout failed", e);
    return Response.json({ error: "Checkout couldn't start. Please try again in a moment." }, { status: 500 });
  }
}
