import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { formatCents } from "@/lib/orders";
import { db } from "@/prisma/db";

const PAID = new Set(["paid", "packed", "shipped", "delivered", "needs_attention"]);

export default function AdminHome() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin();

  const orders = await db.orm.public.Order.select("id", "number", "status", "totalCents", "email", "createdAt")
    .orderBy((o) => o.id.desc())
    .limit(1000)
    .all();
  const lowStock = await db.orm.public.Variant.where((v) => v.stock.lte(3))
    .include("product", (p) => p.select("name", "slug"))
    .orderBy((v) => v.stock.asc())
    .limit(20)
    .all();

  const paid = orders.filter((o) => PAID.has(o.status));
  const revenue = paid.reduce((s, o) => s + o.totalCents, 0);
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "packed").length;
  const attention = orders.filter((o) => o.status === "needs_attention").length;
  const stats = [
    ["Revenue", formatCents(revenue)],
    ["Paid orders", String(paid.length)],
    ["Average order", paid.length ? formatCents(Math.round(revenue / paid.length)) : "–"],
    ["To ship", String(toShip)],
  ];

  return (
    <div className="space-y-12">
      <h1 className="font-display text-5xl font-light">Overview</h1>

      {attention > 0 && (
        <Link href="/admin/orders?status=needs_attention" className="block rounded-2xl border border-[#e8b4a0]/40 bg-[#e8b4a0]/10 p-5 text-sm text-[#e8b4a0]">
          {attention} paid order{attention > 1 ? "s" : ""} could not be fully stocked. Review and contact the customer →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-void p-6">
            <p className="text-xs tracking-[0.18em] text-mist uppercase">{label}</p>
            <p className="mt-3 font-display text-4xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl">Recent orders</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {orders.filter((o) => o.status !== "pending").slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                <span>
                  {o.number} <span className="text-mist">· {o.email ?? "guest"}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-mist uppercase">{o.status.replace("_", " ")}</span>
                  {formatCents(o.totalCents)}
                </span>
              </li>
            ))}
            {paid.length === 0 && <li className="py-3 text-mist">No paid orders yet.</li>}
          </ul>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm text-mist underline underline-offset-4 hover:text-bone">All orders</Link>
        </section>
        <section>
          <h2 className="font-display text-2xl">Low stock (3 or fewer)</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
            {lowStock.map((v) => (
              <li key={v.id} className="flex justify-between gap-4 py-3">
                <span>
                  {v.product?.name} <span className="text-mist">· {v.color} · {v.size}</span>
                </span>
                <span className={v.stock === 0 ? "text-[#e8b4a0]" : ""}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="py-3 text-mist">Everything is well stocked.</li>}
          </ul>
          <Link href="/admin/products" className="mt-4 inline-block text-sm text-mist underline underline-offset-4 hover:text-bone">Manage stock</Link>
        </section>
      </div>
    </div>
  );
}
