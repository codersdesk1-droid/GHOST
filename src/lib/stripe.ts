import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/** One Stripe client per process. The key comes from the Vercel Stripe integration. */
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key);
  return client;
}
