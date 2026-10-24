"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cart, cartTotals, useCart } from "./cart/store";
import { Wordmark } from "./Logo";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?c=tees", label: "Tees" },
  { href: "/shop?c=hoodies", label: "Hoodies" },
  { href: "/quality", label: "Quality" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const { lines } = useCart();
  const { count } = cartTotals(lines);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex h-14 max-w-[1440px] items-center justify-between rounded-full px-5 transition-all duration-700 ease-ghost sm:px-7 ${
          scrolled || menu ? "glass" : "border border-transparent"
        }`}
      >
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className="eyebrow !text-bone/70 transition hover:!text-bone">
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="eyebrow !text-bone md:hidden"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-controls="mobile-menu"
        >
          {menu ? "Close" : "Menu"}
        </button>

        <Link href="/" aria-label="Ghost, home" className="absolute left-1/2 -translate-x-1/2 text-bone">
          <Wordmark className="h-7 sm:h-8" />
        </Link>

        <div className="flex items-center gap-7">
          {NAV.slice(3).map((n) => (
            <Link key={n.href} href={n.href} className="eyebrow hidden !text-bone/70 transition hover:!text-bone md:inline">
              {n.label}
            </Link>
          ))}
          <button
            onClick={() => cart.setOpen(true)}
            className="eyebrow flex items-center gap-2 !text-bone"
            aria-label={`Open bag, ${count} items`}
          >
            Bag
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-bone px-1.5 text-[0.65rem] tracking-normal text-void">
              {count}
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`glass mx-auto mt-2 grid max-w-[1440px] overflow-hidden rounded-3xl transition-all duration-500 ease-ghost md:hidden ${
          menu ? "max-h-96 p-6 opacity-100" : "pointer-events-none max-h-0 p-0 opacity-0"
        }`}
      >
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="border-b border-line py-3 font-display text-2xl last:border-0">
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
