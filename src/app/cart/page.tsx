import type { Metadata } from "next";
import CartPage from "@/components/cart/CartPage";
import { products } from "@/data/products";
import { getAllProductImages } from "@/lib/images";

export const metadata: Metadata = { title: "Your bag" };

export default async function Page() {
  const images = await getAllProductImages(products.map((p) => p.slug));
  return <CartPage images={images} />;
}
