import { revalidateTag } from "next/cache";
import { after } from "next/server";
import type Stripe from "stripe";
import { CATALOG_TAG } from "@/lib/catalog";
import { sendOrderConfirmation } from "@/lib/email";
import { cancelSession, fulfilSession } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

/**
 * Stripe webhook: the only place orders become paid and stock is taken.
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // Delayed payment methods complete while still unpaid; wait for async_payment_succeeded.
      if (session.payment_status === "unpaid") break;
      const { result, orderId } = await fulfilSession(event.id, event.type, session);
      if (result === "paid" || result === "needs-attention") {
        revalidateTag(CATALOG_TAG, "max");
        // Email after responding, so Stripe gets its 200 straight away.
        if (orderId !== null) after(() => sendOrderConfirmation(orderId).catch((e) => console.error("[email] confirmation", e)));
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await cancelSession(event.id, event.type, event.data.object.id);
      break;
  }

  return Response.json({ received: true });
}
