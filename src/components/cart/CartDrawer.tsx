"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/data/products";
import { useCatalog, useShipping } from "./CatalogProvider";
import ProductVisual from "../ProductVisual";
import { cart, cartTotals, useCart, type CartLine } from "./store";
import { pickImage } from "./pickImage";

export default function CartDrawer({ images }: { images: Record<string, string[]> }) {
  const { lines, open } = useCart();
  const find = useCatalog();
  const rules = useShipping();
  const totals = cartTotals(lines, find, rules);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => cart.setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={`glass absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] max-w-md flex-col rounded-[28px] !bg-ink/80 transition-transform duration-700 ease-ghost ${
          open ? "translate-x-0" : "translate-x-[110%]"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <p className="font-display text-2xl">
            Your bag <span className="text-mist">({totals.count})</span>
          </p>
          <button onClick={() => cart.setOpen(false)} className="eyebrow !text-bone" aria-label="Close bag">
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <p className="font-display text-3xl italic text-bone/80">Nothing here yet.</p>
              <p className="mt-3 text-sm text-mist">Even ghosts need something to wear.</p>
              <Link
                href="/shop"
                onClick={() => cart.setOpen(false)}
                className="mt-8 inline-flex rounded-full bg-bone px-7 py-3 text-sm text-void transition hover:bg-white"
              >
                Browse the drop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4">
              {lines.map((l) => (
                <Line key={`${l.slug}-${l.color}-${l.size}`} line={l} images={images[l.slug] ?? []} />
              ))}
            </ul>
            <div className="space-y-2 border-t border-line px-6 pt-5 pb-6 text-sm">
              <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
              <Row
                label="Shipping"
                value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
                hint={totals.shipping ? `Free over ${formatPrice(rules.freeShippingCents / 100)}` : undefined}
              />
              <div className="flex items-baseline justify-between pt-2">
                <span className="eyebrow">Total</span>
                <span className="font-display text-3xl">{formatPrice(totals.total)}</span>
              </div>
              <Link
                href="/cart"
                onClick={() => cart.setOpen(false)}
                className="mt-4 flex h-14 items-center justify-center rounded-full bg-bone text-base text-void transition hover:bg-white"
              >
                View bag &amp; checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex justify-between text-mist">
      <span>
        {label}
        {hint && <span className="ml-2 text-xs text-fog">{hint}</span>}
      </span>
      <span className="text-bone">{value}</span>
    </div>
  );
}

function Line({ line, images }: { line: CartLine; images: string[] }) {
  const p = useCatalog()(line.slug);
  if (!p) return null;
  const color = p.colors.find((c) => c.name === line.color) ?? p.colors[0];
  return (
    <li className="flex gap-4 rounded-2xl bg-white/[0.03] p-3">
      <Link
        href={`/product/${p.slug}`}
        onClick={() => cart.setOpen(false)}
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-smoke"
      >
        <ProductVisual
          src={pickImage(images, color.name)}
          alt={p.name}
          category={p.category}
          color={color.hex}
          id={`cart-${p.slug}-${line.color}-${line.size}`}
          sizes="80px"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <p className="text-sm leading-tight">{p.name}</p>
          <p className="text-sm">{formatPrice(p.price * line.qty)}</p>
        </div>
        <p className="mt-1 text-xs text-mist">
          {line.color} · {line.size}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <Qty line={line} />
          <button onClick={() => cart.remove(line)} className="text-xs text-mist underline-offset-4 hover:text-bone hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function Qty({ line }: { line: CartLine }) {
  return (
    <div className="flex items-center rounded-full border border-line">
      <button className="grid h-8 w-8 place-items-center text-mist hover:text-bone" onClick={() => cart.setQty(line, line.qty - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
      <button className="grid h-8 w-8 place-items-center text-mist hover:text-bone" onClick={() => cart.setQty(line, line.qty + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
