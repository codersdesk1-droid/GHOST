import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductForm, StockForm } from "@/components/admin/Forms";
import { products as editorial } from "@/data/products";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Products & stock" };

export default function AdminProducts() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  await requireAdmin();
  const rows = await db.orm.public.Product.include("variants").orderBy((p) => p.id.asc()).all();

  return (
    <div>
      <h1 className="font-display text-5xl font-light">Products &amp; stock</h1>
      <p className="mt-3 max-w-2xl text-sm text-mist">
        Prices, sale prices, badges and stock save straight to the live store. Descriptions, sizes and colours live in
        <code className="mx-1 text-bone/80">src/data/products.ts</code>; after adding a new piece there, run
        <code className="mx-1 text-bone/80">npm run db:seed</code>.
      </p>
      <ul className="mt-10 space-y-6">
        {rows.map((p) => {
          const copy = editorial.find((e) => e.slug === p.slug);
          const colors = copy?.colors.map((c) => c.name) ?? [...new Set(p.variants.map((v) => v.color))];
          const sizes = copy?.sizes ?? [...new Set(p.variants.map((v) => v.size))];
          const total = p.variants.reduce((s, v) => s + v.stock, 0);
          return (
            <li key={p.id} className="glass rounded-[28px] p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-2xl">
                  {p.name} {!p.active && <span className="ml-2 align-middle text-xs text-[#e8b4a0] uppercase">Hidden</span>}
                </p>
                <p className="text-sm text-mist">
                  {total} in stock ·{" "}
                  <Link href={`/product/${p.slug}`} className="underline underline-offset-4 hover:text-bone">View</Link>
                </p>
              </div>
              <ProductForm product={p} />
              <StockForm productId={p.id} colors={colors} sizes={sizes} variants={p.variants} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
