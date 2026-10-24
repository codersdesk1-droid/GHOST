"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, type Product } from "@/data/products";
import { Sparkle, Wordmark } from "../Logo";
import ProductVisual from "../ProductVisual";

type Slide = { product: Product; images: string[]; hotspot: { x: number; y: number } };

const DURATION = 7000;

export default function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[i];
  const p = slide.product;
  const meter = p.meters[0];

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, slides.length]);

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 pt-28 pb-8 sm:px-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured pieces"
    >
      <div className="fog -z-10" />
      <div className="fog -z-10 [animation-delay:-11s] [animation-direction:alternate-reverse]" />
      {/* giant ghost wordmark */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 px-4 text-bone/[0.035]">
        <Wordmark className="w-full" />
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr_0.7fr]">
        {/* copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="eyebrow flex items-center gap-2">
            <Sparkle className="h-3 w-3 text-bone" /> Drop 01 · Autumn / Winter ’26
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.92] font-light tracking-tight [font-variation-settings:'SOFT'_100]">
            Quiet clothes
            <br />
            <em className="text-bone/60">for loud minds.</em>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-mist">
            Heavyweight oversized essentials, cut boxy and built to last. No noise — just weight, drape and detail.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="group glass flex h-16 items-center gap-6 rounded-full pr-7 pl-2"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-bone text-void transition-transform duration-500 ease-ghost group-hover:translate-x-1">
                →
              </span>
              <span className="text-sm">Explore the drop</span>
              <span className="tracking-[-0.3em] text-mist transition-all duration-500 group-hover:tracking-normal group-hover:text-bone">›››</span>
            </Link>
            <Link href="/quality" className="px-4 text-sm text-mist underline-offset-8 hover:text-bone hover:underline">
              Feel the quality
            </Link>
          </div>
        </div>

        {/* the piece */}
        <div className="relative order-1 mx-auto aspect-[4/5] w-full max-w-[560px] lg:order-2">
          {slides.map((s, n) => (
            <div
              key={s.product.slug}
              className={`absolute inset-0 transition-all duration-[1400ms] ease-ghost ${
                n === i ? "scale-100 opacity-100 blur-0" : "scale-[0.96] opacity-0 blur-md"
              }`}
              aria-hidden={n !== i}
            >
              <div className="animate-float absolute inset-0">
                <ProductVisual
                  src={s.images[0]}
                  alt={s.product.name}
                  category={s.product.category}
                  color={s.product.colors[0].hex}
                  id={`hero-${s.product.slug}`}
                  priority={n === 0}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className={s.images[0] ? "rounded-[32px]" : ""}
                />
              </div>
            </div>
          ))}

          {/* hotspot + glass spec card, like the reference */}
          <div
            key={`hs-${i}`}
            className="absolute z-10 transition-all duration-700 ease-ghost"
            style={{ left: `${slide.hotspot.x}%`, top: `${slide.hotspot.y}%` }}
          >
            <span className="pulse-ring relative block h-5 w-5 rounded-full bg-bone shadow-[0_0_24px_rgba(215,210,197,0.8)]" />
          </div>
          <div
            key={`card-${i}`}
            className="glass absolute z-10 w-52 animate-[float_7s_ease-in-out_infinite] rounded-3xl p-5 [animation-delay:-2s] max-sm:!top-2 max-sm:!left-0 sm:w-60"
            style={{
              left: `min(calc(${slide.hotspot.x}% + 28px), calc(100% - 15rem))`,
              top: `calc(${slide.hotspot.y}% - 130px)`,
            }}
          >
            <p className="text-sm">{meter.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex gap-1.5">
                {[0, 1, 2, 3].map((d) => (
                  <span key={d} className={`h-3 w-3 rounded-full ${d < meter.value ? "bg-bone" : "bg-bone/15"}`} />
                ))}
              </span>
              <span className="text-sm text-mist">{meter.value}/4</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mist">{meter.note}</p>
          </div>
        </div>

        {/* product teaser + thumbnails */}
        <div className="order-3 flex min-w-0 flex-wrap items-end justify-between gap-4 lg:flex-col lg:items-end lg:justify-center">
          <Link href={`/product/${p.slug}`} className="glass group block w-full max-w-64 rounded-3xl p-5">
            <p className="eyebrow">{p.category.replace(/s$/, "")}</p>
            <p className="mt-2 font-display text-2xl leading-tight">{p.name}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg">{formatPrice(p.price)}</span>
              <span className="text-xs text-mist transition group-hover:text-bone">View →</span>
            </div>
          </Link>
          <div className="flex gap-2 lg:mt-4" role="tablist" aria-label="Choose featured piece">
            {slides.map((s, n) => (
              <button
                key={s.product.slug}
                role="tab"
                aria-selected={n === i}
                aria-label={s.product.name}
                onClick={() => setI(n)}
                className={`relative h-16 w-14 overflow-hidden rounded-2xl bg-smoke ring-1 transition-all duration-500 sm:h-20 sm:w-16 ${
                  n === i ? "ring-bone/60" : "opacity-50 ring-line hover:opacity-100"
                }`}
              >
                <ProductVisual
                  src={s.images[0]}
                  alt=""
                  category={s.product.category}
                  color={s.product.colors[0].hex}
                  id={`thumb-${s.product.slug}`}
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div className="mx-auto mt-6 flex items-center gap-2">
        {slides.map((s, n) => (
          <span key={s.product.slug} className={`h-1 rounded-full bg-bone transition-all duration-700 ease-ghost ${n === i ? "w-10" : "w-2 opacity-30"}`} />
        ))}
      </div>
    </section>
  );
}
