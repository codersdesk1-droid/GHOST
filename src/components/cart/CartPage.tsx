"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/data/products";
import { useCatalog, useShipping } from "./CatalogProvider";
import ProductVisual from "../ProductVisual";
import { Qty } from "./CartDrawer";
import { pickImage } from "./pickImage";
import { cart, cartTotals, useCart } from "./store";

export default function CartPage({ images }: { images: Record<string, string[]> }) {
  const { lines } = useCart();
  const find = useCatalog();
  const rules = useShipping();
  const free = rules.freeShippingCents / 100;
  const t = cartTotals(lines, find, rules);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      // The server re-prices everything from the database; this is just the bag.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines.filter((l) => find(l.slug)) }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout couldn't start. Please try again.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout couldn't start. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-36 sm:px-10">
      <p className="eyebrow">Bag</p>
      <h1 className="mt-4 font-display text-6xl font-light sm:text-7xl">
        {t.count ? `${t.count} piece${t.count > 1 ? "s" : ""}` : "Empty, for now"}
      </h1>

      {lines.length === 0 ? (
        <Link href="/shop" className="mt-10 inline-flex rounded-full bg-bone px-8 py-4 text-void transition hover:bg-white">
          Browse the drop
        </Link>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l) => {
              const p = find(l.slug);
              if (!p) return null;
              const color = p.colors.find((c) => c.name === l.color) ?? p.colors[0];
              return (
                <li key={`${l.slug}-${l.color}-${l.size}`} className="flex gap-5 py-6">
                  <Link href={`/product/${p.slug}`} className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl bg-smoke sm:w-36">
                    <ProductVisual
                      src={pickImage(images[p.slug] ?? [], color.name)}
                      alt={p.name}
                      category={p.category}
                      color={color.hex}
                      id={`bag-${p.slug}-${l.color}-${l.size}`}
                      sizes="144px"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-display text-xl sm:text-2xl">{p.name}</p>
                        <p className="mt-1 text-sm text-mist">
                          {l.color} · Size {l.size} · {formatPrice(p.price)}
                        </p>
                      </div>
                      <p className="text-lg">{formatPrice(p.price * l.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-6">
                      <Qty line={l} />
                      <button onClick={() => cart.remove(l)} className="text-sm text-mist underline-offset-4 hover:text-bone hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="glass h-fit rounded-[28px] p-7 lg:sticky lg:top-28">
            <p className="font-display text-2xl">Summary</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-mist">
                <dt>Subtotal</dt>
                <dd className="text-bone">{formatPrice(t.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-mist">
                <dt>Shipping</dt>
                <dd className="text-bone">{t.shipping ? formatPrice(t.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-mist">
                <dt>Taxes</dt>
                <dd>Calculated at checkout</dd>
              </div>
            </dl>
            {t.shipping > 0 && (
              <div className="mt-5">
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-bone transition-all duration-700" style={{ width: `${Math.min(100, (t.subtotal / free) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-mist">{formatPrice(free - t.subtotal)} away from free shipping</p>
              </div>
            )}
            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
              <span className="eyebrow">Total</span>
              <span className="font-display text-4xl">{formatPrice(t.total)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={busy}
              className="mt-6 h-14 w-full rounded-full bg-bone text-void transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Opening secure checkout…" : "Checkout"}
            </button>
            {error && (
              <p className="mt-4 text-center text-sm text-[#e8b4a0]" role="alert">
                {error}
              </p>
            )}
            <p className="mt-4 text-center text-xs text-fog">Secure payment by Stripe. Cards, wallets and more.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
