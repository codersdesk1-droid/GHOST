"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CatalogProduct } from "@/lib/catalog";

const CatalogContext = createContext<CatalogProduct[]>([]);

/** Gives client components (the bag, mainly) the live prices and stock. */
export function CatalogProvider({ products, children }: { products: CatalogProduct[]; children: ReactNode }) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const products = useContext(CatalogContext);
  return (slug: string) => products.find((p) => p.slug === slug);
}
