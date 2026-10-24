"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, type Category, type Product } from "@/data/products";
import ProductCard from "../ProductCard";

export default function DropStrip({
  products,
  images,
}: {
  products: Product[];
  images: Record<string, string[]>;
}) {
  const [active, setActive] = useState<Category | "all">("all");
  const list = active === "all" ? products : products.filter((p) => p.category === active);
  const tabs = [{ id: "all" as const, label: "All" }, ...categories];

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 sm:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-x-7 gap-y-2">
          {tabs.map((t) => {
            const count = t.id === "all" ? products.length : products.filter((p) => p.category === t.id).length;
            const on = active === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.id)}
                className={`font-display text-3xl transition-colors duration-500 sm:text-5xl ${on ? "text-bone" : "text-bone/25 hover:text-bone/60"}`}
              >
                {t.label}
                <sup className="ml-1 align-super font-sans text-xs text-mist">{count}</sup>
              </button>
            );
          })}
        </div>
        <Link href="/shop" className="rounded-full border border-line px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition hover:bg-bone hover:text-void">
          All products
        </Link>
      </div>

      <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-4 sm:-mx-10 sm:px-10">
        {list.map((p, n) => (
          <ProductCard
            key={`${active}-${p.slug}`}
            product={p}
            images={images[p.slug] ?? []}
            className="w-[72vw] shrink-0 snap-start animate-[rise_0.9s_var(--ease-ghost)_both] sm:w-[340px]"
            style={{ animationDelay: `${n * 70}ms` }}
          />
        ))}
      </div>
    </section>
  );
}
