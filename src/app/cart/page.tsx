import type { Metadata } from "next";
import CartPage from "@/components/cart/CartPage";
import { getCatalog } from "@/lib/catalog";
import { getAllProductImages } from "@/lib/images";

export const metadata: Metadata = { title: "Your bag" };

export default async function Page() {
  const products = await getCatalog();
  const images = await getAllProductImages(products.map((p) => p.slug));
  return <CartPage images={images} />;
}
