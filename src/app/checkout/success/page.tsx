import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearBag, RefreshWhilePending } from "@/components/checkout/SuccessClient";
import { Sparkle } from "@/components/Logo";
import { formatCents } from "@/lib/orders";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function SuccessPage(props: PageProps<"/checkout/success">) {
  return (
    <div className="relative mx-auto grid min-h-[80svh] max-w-2xl place-items-center px-5 pt-32 text-center">
      <div className="fog -z-10" />
      <ClearBag />
      <Suspense fallback={<p className="text-mist">Looking up your order…</p>}>
        <OrderStatus searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderStatus({ searchParams }: { searchParams: PageProps<"/checkout/success">["searchParams"] }) {
  const { session_id } = await searchParams;
  const order =
    typeof session_id === "string" && session_id.startsWith("cs_")
      ? await db.orm.public.Order.first({ stripeSessionId: session_id })
      : null;

  if (!order) {
    return (
      <div>
        <h1 className="font-display text-5xl font-light">We couldn&apos;t find that order.</h1>
        <p className="mt-4 text-mist">If you paid, your confirmation email has the details.</p>
        <Link href="/shop" className="mt-10 inline-flex rounded-full bg-bone px-8 py-4 text-void">Back to the shop</Link>
      </div>
    );
  }

  // The webhook marks orders paid; until it lands, keep checking quietly.
  const pending = order.status === "pending";
  return (
    <div>
      {pending && <RefreshWhilePending />}
      <Sparkle className={`mx-auto h-6 w-6 text-bone ${pending ? "animate-pulse" : ""}`} />
      <p className="eyebrow mt-8">Order {order.number}</p>
      <h1 className="mt-4 font-display text-[clamp(3rem,9vw,5.5rem)] leading-none font-light">
        {pending ? "Confirming your payment…" : "It's yours."}
      </h1>
      <p className="mt-6 text-mist">
        {pending
          ? "This takes a few seconds. You can stay on this page."
          : `We've got your order for ${formatCents(order.totalCents)}. It ships within 1 to 2 business days${
              order.email ? `, and updates go to ${order.email}` : ""
            }.`}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/account" className="rounded-full bg-bone px-8 py-4 text-void transition hover:bg-white">
          View your orders
        </Link>
        <Link href="/shop" className="rounded-full border border-line px-8 py-4 transition hover:border-bone/40">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
