"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CatalogProduct } from "@/lib/catalog";

export type ShippingRules = { shippingCents: number; freeShippingCents: number };

const CatalogContext = createContext<{ products: CatalogProduct[]; shipping: ShippingRules }>({
  products: [],
  shipping: { shippingCents: 1200, freeShippingCents: 15000 },
});

/** Gives client components (the bag, mainly) live prices, stock and shipping rules. */
export function CatalogProvider({
  products,
  shipping,
  children,
}: {
  products: CatalogProduct[];
  shipping: ShippingRules;
  children: ReactNode;
}) {
  return <CatalogContext.Provider value={{ products, shipping }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const { products } = useContext(CatalogContext);
  return (slug: string) => products.find((p) => p.slug === slug);
}

export function useShipping() {
  return useContext(CatalogContext).shipping;
}
