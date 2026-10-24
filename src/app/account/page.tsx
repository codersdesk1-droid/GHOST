import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRole } from "@/lib/auth";
import { formatCents } from "@/lib/orders";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Your orders", robots: { index: false } };

const LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid · preparing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  needs_attention: "Paid · we'll be in touch",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-36 sm:px-10">
      <p className="eyebrow">Account</p>
      <h1 className="mt-4 font-display text-6xl font-light">Your orders</h1>
      <Suspense fallback={<p className="mt-12 text-mist">Loading your orders…</p>}>
        <Orders />
      </Suspense>
    </div>
  );
}

async function Orders() {
  const { isAuthenticated, userId, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();

  const role = await getRole();
  const adminLink = role && (
    <Link href="/admin" className="mt-8 inline-flex rounded-full border border-line px-6 py-3 text-sm transition hover:border-bone/40">
      Store admin ({role}) →
    </Link>
  );

  const orders = await db.orm.public.Order.where({ clerkUserId: userId })
    .where((o) => o.status.neq("pending"))
    .include("items")
    .orderBy((o) => o.id.desc())
    .limit(50)
    .all();

  if (orders.length === 0) {
    return (
      <div className="mt-12">
        <p className="text-mist">No orders yet. Your first piece is waiting.</p>
        <Link href="/shop" className="mt-8 inline-flex rounded-full bg-bone px-8 py-4 text-void">Browse the drop</Link>
        <div>{adminLink}</div>
      </div>
    );
  }

  return (
    <>
    {adminLink}
    <ul className="mt-12 space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="glass rounded-[28px] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-display text-2xl">{o.number}</p>
              <p className="mt-1 text-sm text-mist">{new Date(o.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full border border-line px-3 py-1 text-xs tracking-[0.12em] uppercase">{LABEL[o.status] ?? o.status}</span>
              <p className="mt-2 text-lg">{formatCents(o.totalCents)}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-1 border-t border-line pt-5 text-sm text-bone/80">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span>
                  {i.quantity} × {i.productName} <span className="text-mist">({i.color}, {i.size})</span>
                </span>
                <span>{formatCents(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          {o.trackingNumber && <p className="mt-4 text-sm text-mist">Tracking: <span className="text-bone">{o.trackingNumber}</span></p>}
        </li>
      ))}
    </ul>
    </>
  );
}
