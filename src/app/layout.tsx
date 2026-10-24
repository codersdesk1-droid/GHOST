import type { Metadata, Viewport } from "next";
import { Fraunces, Jost } from "next/font/google";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { products } from "@/data/products";
import { getAllProductImages } from "@/lib/images";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ghost™ — Wear a vision", template: "%s · Ghost™" },
  description:
    "Ghost makes quiet streetwear: heavyweight oversized tees, hoodies, jackets and baggy pants, built in small batches.",
  openGraph: { siteName: "Ghost™", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0d1010",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const images = await getAllProductImages(products.map((p) => p.slug));
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-void">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer images={images} />
      </body>
    </html>
  );
}
