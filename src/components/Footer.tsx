import Link from "next/link";
import { Sparkle, Wordmark } from "./Logo";
import Newsletter from "./Newsletter";

const COLS = [
  {
    title: "Shop",
    links: [
      ["All pieces", "/shop"],
      ["Tees", "/shop?c=tees"],
      ["Hoodies", "/shop?c=hoodies"],
      ["Jackets", "/shop?c=jackets"],
      ["Pants", "/shop?c=pants"],
    ],
  },
  {
    title: "Help",
    links: [
      ["FAQ", "/faq"],
      ["Shipping", "/info/shipping"],
      ["Returns & exchanges", "/info/returns"],
      ["Contact", "/info/contact"],
    ],
  },
  {
    title: "Ghost",
    links: [
      ["Quality", "/quality"],
      ["Privacy", "/info/privacy"],
      ["Terms", "/info/terms"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line px-5 pt-20 pb-8 sm:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkle className="h-3 w-3 text-bone" /> The Séance list
          </p>
          <p className="mt-5 max-w-sm font-display text-3xl leading-tight">
            Drops arrive quietly. Be the first to know.
          </p>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow">{c.title}</p>
              <ul className="mt-5 space-y-3 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-bone/70 transition hover:text-bone">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-[1440px] text-bone/[0.07]">
        <Wordmark className="w-full" />
      </div>
      <div className="mx-auto mt-6 flex max-w-[1440px] flex-wrap justify-between gap-3 text-xs text-fog">
        <p>© 2026 Ghost™. Wear a vision.</p>
        <p>Made in small batches.</p>
      </div>
    </footer>
  );
}
