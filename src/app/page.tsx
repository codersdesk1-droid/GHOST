import Link from "next/link";
import Faq from "@/components/Faq";
import Anatomy from "@/components/home/Anatomy";
import DropStrip from "@/components/home/DropStrip";
import FogHero from "@/components/home/FogHero";
import { Sparkle } from "@/components/Logo";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getCatalog, photoMap } from "@/lib/catalog";

const STATS = [
  ["280–480", "GSM fabric weight"],
  ["<3%", "Shrinkage after wash"],
  ["300", "Pieces per limited run"],
  ["14", "Day free returns"],
];

export default async function Home() {
  const products = await getCatalog();
  const images = photoMap(products);
  const bestSellers = products.filter((p) => p.badge === "Best seller");

  return (
    <>
      <FogHero />

      {/* marquee */}
      <div className="overflow-hidden border-y border-line py-5" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Heavyweight cotton", "Boxy fits", "Made in small batches", "Pre-shrunk", "Wear a vision", "Quiet by design"].map((t) => (
              <span key={`${k}-${t}`} className="eyebrow flex items-center gap-10 !text-bone/60">
                {t} <Sparkle className="h-2.5 w-2.5 text-bone/40" />
              </span>
            )),
          )}
        </div>
      </div>

      <DropStrip products={products} images={images} />

      {/* quality */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10">
        <Reveal className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow">The difference</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-light">
              Pick it up.
              <br />
              <em className="text-bone/60">Then you&apos;ll get it.</em>
            </h2>
          </div>
          <p className="max-w-md text-mist lg:justify-self-end">
            Every Ghost piece starts with fabric nearly twice the weight of an ordinary tee, then gets cut,
            washed and stitched to keep its shape for years, not weeks. Tap a point to look closer.
          </p>
        </Reveal>
        <Reveal>
          <Anatomy />
        </Reveal>
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-line bg-line lg:grid-cols-4">
          {STATS.map(([v, l], n) => (
            <Reveal key={l} delay={n * 90} className="bg-void p-6 sm:p-10">
              <p className="font-display text-4xl font-light sm:text-6xl">{v}</p>
              <p className="mt-3 text-xs tracking-[0.2em] text-mist uppercase">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* manifesto */}
      <section className="relative overflow-hidden px-5 py-32 sm:px-10 sm:py-44">
        <div className="fog -z-10 opacity-70" />
        <Reveal className="mx-auto max-w-5xl text-center">
          <Sparkle className="mx-auto h-6 w-6 text-bone" />
          <p className="mt-10 font-display text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.15] font-light [font-variation-settings:'SOFT'_100]">
            Ghost is for the ones who don&apos;t need to announce themselves.
            <span className="text-bone/40"> Muted colours, heavy fabric, honest construction. Clothes that
            stay with you long after the trend has moved on.</span>
          </p>
          <p className="eyebrow mt-10">Wear a vision</p>
        </Reveal>
      </section>

      {/* best sellers */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <Reveal className="flex items-end justify-between">
          <h2 className="font-display text-4xl sm:text-5xl">Most worn</h2>
          <Link href="/shop" className="text-sm text-mist underline underline-offset-8 hover:text-bone">
            See all
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((p, n) => (
            <Reveal key={p.slug} delay={n * 100}>
              <ProductCard product={p} images={images[p.slug] ?? []} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* faq */}
      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-32 sm:px-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-4 max-w-sm font-display text-4xl leading-tight sm:text-5xl">
            Fit, fabric, shipping, returns. The things you ask us most, answered.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <Faq />
        </Reveal>
      </section>
    </>
  );
}
