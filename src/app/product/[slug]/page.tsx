import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductView from "@/components/product/ProductView";
import { getCatalog, getCatalogProduct, photoMap } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getCatalogProduct(slug);
  return p ? { title: p.name, description: `${p.tagline} ${p.description}` } : {};
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Product params={props.params} />
    </Suspense>
  );
}

async function Product({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  const products = await getCatalog();
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== slug && p.category === product.category).concat(
    products.filter((p) => p.category !== product.category),
  ).slice(0, 4);
  const relatedImages = photoMap(related);

  return (
    <>
      <ProductView product={product} />
      <section className="mx-auto max-w-[1440px] px-5 pt-24 sm:px-10">
        <h2 className="font-display text-4xl">Wear it with</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} images={relatedImages[p.slug] ?? []} />
          ))}
        </div>
      </section>
    </>
  );
}
