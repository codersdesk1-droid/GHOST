import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductEditor, { EMPTY_PRODUCT } from "@/components/admin/ProductEditor";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Editor />
    </Suspense>
  );
}

async function Editor() {
  await requireStaff();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm text-mist hover:text-bone">← All products</Link>
      <h1 className="mt-4 font-display text-5xl font-light">New product</h1>
      <p className="mt-3 mb-8 text-sm text-mist">Fill in the details and create it. Photos and stock come next, on the product&apos;s page.</p>
      <ProductEditor product={EMPTY_PRODUCT} />
    </div>
  );
}
