import { auth, currentUser } from "@clerk/nextjs/server";
import { createPendingOrder, CheckoutError, type CheckoutLine } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { db } from "@/prisma/db";

const MAX_LINES = 20;
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
  const lines = parseLines(await req.json().catch(() => null));
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
