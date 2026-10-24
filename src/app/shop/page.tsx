import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { categories, type Category } from "@/data/products";
import { getCatalog, photoMap } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "Oversized tees, heavyweight hoodies, jackets and baggy pants from Ghost.",
};

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "new", label: "Newest" },
  { id: "low", label: "Price ↑" },
  { id: "high", label: "Price ↓" },
];

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-36 sm:px-10">
      <p className="eyebrow">Drop 01 · AW26</p>
      <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] leading-none font-light">The collection</h1>
      <Suspense fallback={<Grid category={undefined} sort="featured" />}>
        <Filtered searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Filtered({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const sp = await searchParams;
  const c = typeof sp.c === "string" && categories.some((x) => x.id === sp.c) ? (sp.c as Category) : undefined;
  const sort = typeof sp.sort === "string" && SORTS.some((s) => s.id === sp.sort) ? sp.sort : "featured";
  return <Grid category={c} sort={sort} />;
}

async function Grid({ category, sort }: { category?: Category; sort: string }) {
  const products = await getCatalog();
  const images = photoMap(products);
  let list = category ? products.filter((p) => p.category === category) : [...products];
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "new") list = [...list.filter((p) => p.badge === "New"), ...list.filter((p) => p.badge !== "New")];

  const href = (c?: string, s = sort) => {
    const q = new URLSearchParams();
    if (c) q.set("c", c);
    if (s !== "featured") q.set("sort", s);
    const str = q.toString();
    return str ? `/shop?${str}` : "/shop";
  };

  return (
    <>
      <div className="sticky top-20 z-30 -mx-2 mt-10 flex flex-wrap items-center justify-between gap-3 py-3">
        <nav className="glass flex flex-wrap gap-1 rounded-full p-1" aria-label="Categories">
          {[{ id: undefined, label: "All" }, ...categories].map((c) => {
            const on = category === c.id;
            return (
              <Link
                key={c.label}
                href={href(c.id)}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-xs tracking-[0.18em] uppercase transition ${on ? "bg-bone text-void" : "text-bone/70 hover:text-bone"}`}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>
        <nav className="glass flex gap-1 rounded-full p-1" aria-label="Sort">
          {SORTS.map((s) => (
            <Link
              key={s.id}
              href={href(category, s.id)}
              scroll={false}
              aria-current={sort === s.id ? "true" : undefined}
              className={`rounded-full px-3 py-2 text-xs transition ${sort === s.id ? "bg-white/10 text-bone" : "text-mist hover:text-bone"}`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p, n) => (
          <ProductCard
            key={p.slug}
            product={p}
            images={images[p.slug] ?? []}
            className="animate-[rise_0.9s_var(--ease-ghost)_both]"
            style={{ animationDelay: `${n * 60}ms` }}
          />
        ))}
      </div>
    </>
  );
}
