"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Category } from "@/data/products";
import ProductVisual from "../ProductVisual";

/** A shot is a photo URL, or a placeholder view of the drawn garment. */
export type Shot = string | "front" | "detail" | "back";
const PLACEHOLDER_LABEL: Record<string, string> = { front: "Front", detail: "Detail", back: "Back" };
const isPhoto = (s: Shot) => s.startsWith("/");

/**
 * Swipeable product gallery: a scroll-snap track, so phones swipe natively and
 * trackpads scroll sideways. Arrows, dots and the arrow keys move it too; hover
 * zoom is for mouse pointers only so it never fights a swipe.
 */
export default function ProductGallery({
  shots,
  name,
  colorName,
  colorHex,
  category,
  slug,
  badge,
}: {
  shots: Shot[];
  name: string;
  colorName: string;
  colorHex: string;
  category: Category;
  slug: string;
  badge?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const count = shots.length;

  function go(n: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(count - 1, n));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const n = Math.round(el.scrollLeft / el.clientWidth);
    if (n !== view) {
      setView(n);
      setZoom(null);
      setSwiped(true);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(view + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(view - 1);
    }
  }

  const label = (s: Shot, n: number) => (isPhoto(s) ? `Photo ${n + 1}` : PLACEHOLDER_LABEL[s]);

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-gradient-to-b from-smoke to-void ring-1 ring-line lg:aspect-[5/5.4]">
      <div
        ref={track}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} photos, ${count} views. Swipe or use the arrow keys.`}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none focus-visible:ring-2 focus-visible:ring-bone/60 focus-visible:ring-inset"
      >
        {shots.map((s, n) => {
          const zoomed = zoom && n === view;
          return (
            <div
              key={`${s}-${n}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${label(s, n)}, ${n + 1} of ${count}`}
              className="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden pointer-fine:cursor-zoom-in"
              onMouseMove={(e) => {
                if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setZoom(null)}
            >
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{
                  transform: zoomed ? "scale(1.8)" : s === "detail" ? "scale(2.2)" : s === "back" ? "scaleX(-1)" : undefined,
                  transformOrigin: zoomed ? `${zoom.x}% ${zoom.y}%` : s === "detail" ? "50% 30%" : "center",
                }}
              >
                <ProductVisual
                  src={isPhoto(s) ? s : undefined}
                  alt={`${name} in ${colorName}, ${label(s, n).toLowerCase()}`}
                  category={category}
                  color={colorHex}
                  id={`pdp-${slug}-${n}`}
                  priority={n === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/shop" className="glass absolute top-4 left-4 grid h-11 w-11 place-items-center rounded-full" aria-label="Back to shop">
        ←
      </Link>
      {badge && (
        <span className="glass absolute top-4 right-4 rounded-full px-4 py-2 text-[0.65rem] tracking-[0.2em] uppercase">{badge}</span>
      )}

      {count > 1 && (
        <>
          <button
            onClick={() => go(view - 1)}
            disabled={view === 0}
            aria-label="Previous view"
            className="glass absolute top-1/2 left-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-lg transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0"
          >
            ‹
          </button>
          <button
            onClick={() => go(view + 1)}
            disabled={view === count - 1}
            aria-label="Next view"
            className="glass absolute top-1/2 right-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-lg transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0"
          >
            ›
          </button>

          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-3">
            <span className="glass rounded-full px-3 py-1 text-[0.65rem] tracking-[0.2em] uppercase" aria-hidden="true">
              {/* touch screens get a swipe hint until the first swipe */}
              {!swiped && <span className="pointer-fine:hidden">Swipe · </span>}
              {label(shots[view], view)}
            </span>
            <div className="flex gap-1">
              {shots.map((s, n) => (
                <button
                  key={`${s}-${n}`}
                  onClick={() => go(n)}
                  aria-label={`Show ${label(s, n).toLowerCase()}`}
                  aria-current={n === view}
                  className="grid h-6 min-w-6 place-items-center"
                >
                  <span className={`block h-1.5 rounded-full bg-bone transition-all duration-500 ${n === view ? "w-8" : "w-1.5 opacity-40"}`} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
