import type { Metadata } from "next";
import CartPage from "@/components/cart/CartPage";
import { getCatalog, photoMap } from "@/lib/catalog";

export const metadata: Metadata = { title: "Your bag" };

export default async function Page() {
  const products = await getCatalog();
  const images = photoMap(products);
  return <CartPage images={images} />;
}
