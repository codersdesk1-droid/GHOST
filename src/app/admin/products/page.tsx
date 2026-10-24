import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import GarmentArt from "@/components/GarmentArt";
import { categories, formatPrice, type Category } from "@/data/products";
import { requireStaff } from "@/lib/auth";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Products" };

export default function AdminProducts() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  await requireStaff();
  const rows = await db.orm.public.Product.include("variants", (v) => v.select("stock"))
    .include("images", (i) => i.orderBy((x) => x.position.asc()).limit(1))
    .include("colors", (c) => c.orderBy((x) => x.position.asc()).limit(1))
    .orderBy((p) => p.position.asc())
    .all();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-light">Products</h1>
          <p className="mt-3 text-sm text-mist">{rows.length} products. Click one to edit its words, photos, sizes, colours and stock.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-bone px-6 py-3 text-sm text-void transition hover:bg-white">
          + New product
        </Link>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => {
          const stock = p.variants.reduce((s, v) => s + v.stock, 0);
          const photo = p.images[0];
          const cat = (categories.some((c) => c.id === p.category) ? p.category : "tees") as Category;
          return (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="glass flex gap-4 rounded-[24px] p-4 transition hover:border-bone/30">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-smoke">
                  {photo ? (
                    <Image src={photo.url} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <GarmentArt category={cat} color={p.colors[0]?.hex ?? "#1d2122"} id={`adm-${p.id}`} className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl">{p.name}</p>
                  <p className="mt-1 text-sm">{formatPrice(p.priceCents / 100)}</p>
                  <p className={`mt-2 text-xs ${stock === 0 ? "text-[#e8b4a0]" : "text-mist"}`}>{stock === 0 ? "Out of stock" : `${stock} in stock`}</p>
                  <p className="mt-1 text-xs">
                    {p.active ? <span className="text-mist">On the store</span> : <span className="text-[#e8b4a0]">Hidden</span>}
                    {!photo && <span className="text-fog"> · no photos</span>}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
