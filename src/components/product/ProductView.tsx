"use client";

import { useMemo, useState } from "react";
import { formatPrice, type Product } from "@/data/products";
import type { CatalogProduct } from "@/lib/catalog";
import { cart } from "../cart/store";
import { imagesForColor } from "../cart/pickImage";
import ProductGallery, { type Shot } from "./ProductGallery";
import SizeChart from "./SizeChart";

export default function ProductView({ product: p, images }: { product: CatalogProduct; images: string[] }) {
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [chart, setChart] = useState(false);
  const [more, setMore] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [added, setAdded] = useState(false);

  // Real photos for this colour, or three placeholder views of the drawn garment
  const shots = useMemo<Shot[]>(() => {
    const own = imagesForColor(images, color.name);
    return own.length ? own : ["front", "detail", "back"];
  }, [images, color.name]);

  const left = size ? (p.stock[`${color.name}|${size}`] ?? 0) : 0;

  function add() {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 600);
      return;
    }
    cart.add({ slug: p.slug, color: color.name, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-3 pt-24 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:gap-10 lg:px-10">
      {/* gallery: remounts per colour so it starts on the first view */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductGallery
          key={color.name}
          shots={shots}
          name={p.name}
          colorName={color.name}
          colorHex={color.hex}
          category={p.category}
          slug={p.slug}
          badge={p.badge}
        />
      </div>

      {/* glass spec panel */}
      <div className="lg:pt-6">
        <div className="glass rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">{p.category.replace(/s$/, "")} · {p.gsm} GSM</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-4 text-mist">{p.tagline}</p>
          <div className={`grid transition-all duration-500 ease-ghost ${more ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <p className="overflow-hidden text-sm leading-relaxed text-mist">{p.description}</p>
          </div>
          <button onClick={() => setMore((m) => !m)} className="mt-3 text-sm" aria-expanded={more}>
            {more ? "Read less" : "Read more"} <span className={`inline-block transition ${more ? "rotate-90" : ""}`}>›</span>
          </button>

          <div className="mt-8">
            <p className="text-sm">
              Colour <span className="ml-2 text-mist">{color.name}</span>
            </p>
            <div className="mt-3 flex gap-3">
              {p.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setColor(c);
                    if (size && (p.stock[`${c.name}|${size}`] ?? 0) <= 0) setSize(null);
                  }}
                  aria-label={c.name}
                  aria-pressed={c.name === color.name}
                  className={`h-11 w-11 rounded-full ring-offset-4 ring-offset-[#1a1f1f] transition-all duration-300 ${
                    c.name === color.name ? "ring-2 ring-bone" : "ring-1 ring-white/20 hover:ring-white/50"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className={`text-sm transition ${nudge ? "animate-[shake_0.4s] text-[#e8b4a0]" : ""}`}>
                Size {nudge && <span className="ml-1 text-xs">Pick one first</span>}
              </p>
              <button onClick={() => setChart(true)} className="text-sm text-mist underline underline-offset-4 hover:text-bone">
                Size chart
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
              {p.sizes.map((s) => {
                const out = (p.stock[`${color.name}|${s}`] ?? 0) <= 0;
                const on = size === s;
                return (
                  <button
                    key={s}
                    role="radio"
                    aria-checked={on}
                    disabled={out}
                    onClick={() => setSize(s)}
                    className={`h-12 min-w-12 rounded-2xl px-3 text-sm transition-all duration-300 ${
                      on ? "bg-bone text-void" : out ? "cursor-not-allowed bg-white/[0.03] text-fog line-through" : "bg-white/[0.06] hover:bg-white/[0.12]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-mist">
              {size && left > 0 && left <= 3 ? `Only ${left} left in ${color.name}, size ${size}. ` : ""}
              {p.fit}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              {p.compareAt && <p className="text-sm text-mist line-through">{formatPrice(p.compareAt)}</p>}
              <p className="font-display text-3xl">{formatPrice(p.price)}</p>
            </div>
            <button
              onClick={add}
              className="h-14 flex-1 rounded-full bg-bone px-8 text-base text-void transition-all duration-300 hover:bg-white active:scale-[0.98] sm:max-w-60"
            >
              {added ? "Added ✦" : "Add to bag"}
            </button>
          </div>
          <p className="mt-4 text-xs text-mist">Free shipping over $150 · Free 14-day returns · Ships in 1–2 days</p>
        </div>

        {/* quality meters */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {p.meters.map((m) => (
            <div key={m.label} className="rounded-3xl border border-line p-5">
              <p className="text-sm">{m.label}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex gap-1.5">
                  {[0, 1, 2, 3].map((d) => (
                    <span key={d} className={`h-2.5 w-2.5 rounded-full ${d < m.value ? "bg-bone" : "bg-bone/15"}`} />
                  ))}
                </span>
                <span className="text-xs text-mist">{m.value}/4</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-mist">{m.note}</p>
            </div>
          ))}
        </div>

        <Details product={p} />
      </div>

      <SizeChart open={chart} onClose={() => setChart(false)} category={p.category} />
    </div>
  );
}

function Details({ product: p }: { product: Product }) {
  const [open, setOpen] = useState<string | null>("Details");
  const sections: [string, React.ReactNode][] = [
    [
      "Details",
      <ul key="d" className="space-y-2">
        {p.details.map((d) => (
          <li key={d} className="flex gap-3">
            <span className="text-bone">✦</span>
            {d}
          </li>
        ))}
      </ul>,
    ],
    ["Fabric & fit", <p key="f">{p.fabric}, {p.gsm} GSM. {p.fit}.</p>],
    [
      "Care",
      <ul key="c" className="space-y-1">
        {p.care.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>,
    ],
    ["Shipping & returns", <p key="s">Ships within 1–2 business days. Free shipping over $150. Unworn pieces can be returned within 14 days.</p>],
  ];
  return (
    <div className="mt-6 divide-y divide-line border-y border-line">
      {sections.map(([title, body]) => {
        const on = open === title;
        return (
          <div key={title}>
            <button className="flex w-full items-center justify-between py-5 text-left" onClick={() => setOpen(on ? null : title)} aria-expanded={on}>
              <span>{title}</span>
              <span className={`text-mist transition-transform duration-500 ${on ? "rotate-45" : ""}`}>+</span>
            </button>
            <div className={`grid text-sm leading-relaxed text-mist transition-all duration-500 ease-ghost ${on ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">{body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
