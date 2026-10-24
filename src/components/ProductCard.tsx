import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import ProductVisual from "./ProductVisual";

export default function ProductCard({
  product: p,
  images,
  className = "",
  style,
}: {
  product: Product;
  images: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const [first, second] = images;
  return (
    <Link href={`/product/${p.slug}`} className={`group block ${className}`} style={style}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-gradient-to-b from-smoke to-ink ring-1 ring-line">
        <ProductVisual
          src={first}
          alt={p.name}
          category={p.category}
          color={p.colors[0].hex}
          id={`card-${p.slug}`}
          className="transition duration-[1.2s] ease-ghost group-hover:scale-[1.04]"
        />
        {/* second photo or second colourway on hover */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-ghost group-hover:opacity-100">
          <ProductVisual
            src={second}
            alt=""
            category={p.category}
            color={(p.colors[1] ?? p.colors[0]).hex}
            id={`card-alt-${p.slug}`}
            className={first && !second ? "hidden" : ""}
          />
        </div>
        {p.badge && (
          <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-[0.65rem] tracking-[0.2em] uppercase">
            {p.badge}
          </span>
        )}
        <div className="glass absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between rounded-2xl px-4 py-3 opacity-0 transition duration-500 ease-ghost group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-xs text-mist">{p.gsm} GSM · {p.fit.split(" — ")[0]}</span>
          <span className="flex gap-1">
            {p.colors.map((c) => (
              <span key={c.name} className="h-3 w-3 rounded-full ring-1 ring-white/30" style={{ background: c.hex }} />
            ))}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <p className="text-sm text-bone/90">{p.name}</p>
        <p className="shrink-0 text-sm">
          {p.compareAt && <span className="mr-2 text-mist line-through">{formatPrice(p.compareAt)}</span>}
          {formatPrice(p.price)}
        </p>
      </div>
    </Link>
  );
}
