import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StockForm } from "@/components/admin/Forms";
import PhotoManager from "@/components/admin/PhotoManager";
import ProductEditor from "@/components/admin/ProductEditor";
import { requireStaff } from "@/lib/auth";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProduct(props: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Editor params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Editor({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/products/[id]">["params"];
  searchParams: PageProps<"/admin/products/[id]">["searchParams"];
}) {
  await requireStaff();
  const { id: raw } = await params;
  const { created } = await searchParams;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();

  const p = await db.orm.public.Product.where({ id })
    .include("colors", (c) => c.orderBy((x) => x.position.asc()))
    .include("meters", (m) => m.orderBy((x) => x.position.asc()))
    .include("images", (i) => i.orderBy((x) => x.position.asc()))
    .include("variants")
    .first();
  if (!p) notFound();

  const colors = p.colors.map((c) => c.name);
  const sizes = p.sizes.split(",").filter(Boolean);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-mist hover:text-bone">← All products</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-5xl font-light">{p.name}</h1>
          <Link href={`/product/${p.slug}`} className="text-sm text-mist underline underline-offset-4 hover:text-bone" target="_blank">
            View on store ↗
          </Link>
        </div>
        {created && (
          <p className="mt-4 rounded-2xl border border-line bg-white/[0.03] p-4 text-sm" role="status">
            Created. Now add photos and stock below, then tick &ldquo;Show this product on the store&rdquo; and save.
          </p>
        )}
      </div>

      <PhotoManager productId={p.id} slug={p.slug} colors={colors} photos={p.images.map(({ id, url, color, alt }) => ({ id, url, color, alt }))} />

      <div className="glass rounded-[24px] p-6">
        <p className="font-display text-xl">Stock</p>
        <p className="mt-1 text-xs text-mist">How many of each colour and size you have. Paid orders take stock automatically.</p>
        <StockForm productId={p.id} colors={colors} sizes={sizes} variants={p.variants} />
      </div>

      <ProductEditor
        product={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          priceCents: p.priceCents,
          compareAtCents: p.compareAtCents,
          badge: p.badge,
          active: p.active,
          tagline: p.tagline,
          description: p.description,
          fabric: p.fabric,
          gsm: p.gsm,
          fit: p.fit,
          details: p.details,
          care: p.care,
          sizes: p.sizes,
          colors: p.colors.map(({ name, hex }) => ({ name, hex })),
          meters: p.meters.map(({ label, value, note }) => ({ label, value, note })),
        }}
      />
    </div>
  );
}
