import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderForm } from "@/components/admin/Forms";
import { requireStaff } from "@/lib/auth";
import { formatCents, ORDER_STATUSES } from "@/lib/orders";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Orders" };

const FILTERS = ["all", "paid", "packed", "shipped", "delivered", "needs_attention", "cancelled", "refunded", "pending"];

export default function AdminOrders(props: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Orders searchParams={props.searchParams} />
    </Suspense>
  );
}

function address(json: string | null) {
  if (!json) return null;
  try {
    const a = JSON.parse(json) as Record<string, string | null>;
    return [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.state, a.country].filter(Boolean).join(", ");
  } catch {
    return null;
  }
}

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  await requireStaff();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && FILTERS.includes(sp.status) ? sp.status : "all";

  const base = db.orm.public.Order.include("items").orderBy((o) => o.id.desc()).limit(100);
  const orders = await (status === "all" ? base.where((o) => o.status.neq("pending")) : base.where({ status })).all();

  return (
    <div>
      <h1 className="font-display text-5xl font-light">Orders</h1>
      <nav className="mt-6 flex flex-wrap gap-1" aria-label="Filter orders">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
            aria-current={f === status ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition ${f === status ? "bg-bone text-void" : "text-mist hover:text-bone"}`}
          >
            {f.replace("_", " ")}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-xs text-fog">
        &ldquo;All&rdquo; hides unpaid checkouts. Refunds are issued from the Stripe dashboard; then mark the order refunded here.
      </p>

      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="glass rounded-[24px] p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-display text-2xl">{o.number}</p>
                <p className="mt-1 text-sm text-mist">
                  {new Date(o.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · {o.email ?? "no email"}
                </p>
                {o.shippingName && (
                  <p className="mt-2 text-sm text-bone/80">
                    Ship to {o.shippingName}
                    {address(o.shippingAddress) ? `, ${address(o.shippingAddress)}` : ""}
                  </p>
                )}
              </div>
              <p className="font-display text-3xl">{formatCents(o.totalCents)}</p>
            </div>
            <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span>
                    {i.quantity} × {i.productName} <span className="text-mist">({i.color}, {i.size}) · {i.sku}</span>
                  </span>
                  <span>{formatCents(i.unitPriceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-line pt-5">
              <OrderForm id={o.id} status={o.status} trackingNumber={o.trackingNumber} statuses={ORDER_STATUSES} />
            </div>
          </li>
        ))}
        {orders.length === 0 && <li className="text-mist">No orders here yet.</li>}
      </ul>
    </div>
  );
}
