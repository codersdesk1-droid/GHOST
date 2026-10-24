import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Jost } from "next/font/google";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { CatalogProvider } from "@/components/cart/CatalogProvider";
import { getCatalog, photoMap } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "400",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ghost™ · Wear a vision", template: "%s · Ghost™" },
  description:
    "Ghost makes quiet streetwear: heavyweight oversized tees, hoodies, jackets and baggy pants, built in small batches.",
  openGraph: { siteName: "Ghost™", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0d1010",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = await getCatalog();
  const settings = await getSettings();
  const images = photoMap(catalog);
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable} ${plexMono.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#d7d2c5",
              colorPrimaryForeground: "#0d1010",
              colorBackground: "#151a1a",
              colorForeground: "#d7d2c5",
              colorMutedForeground: "#8d918c",
              colorInput: "#1b2020",
              colorInputForeground: "#d7d2c5",
              colorBorder: "rgb(215 210 197 / 0.14)",
              colorNeutral: "#d7d2c5",
              fontFamily: "var(--font-jost)",
              borderRadius: "14px",
            },
          }}
        >
        <CatalogProvider products={catalog} shipping={{ shippingCents: settings.shippingCents, freeShippingCents: settings.freeShippingCents }}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-void">
          Skip to content
        </a>
        <Header announcement={settings.announcement} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer images={images} />
        </CatalogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
