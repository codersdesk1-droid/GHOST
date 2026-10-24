"use client";

import { useState } from "react";

export const FAQS = [
  {
    q: "How does the oversized fit work?",
    a: "Our tees and hoodies are cut oversized with dropped shoulders. Take your usual size for the intended boxy drape, or size down once for a closer, regular fit. Every product page has a size chart in centimetres.",
  },
  {
    q: "What does GSM mean and why does it matter?",
    a: "GSM means grams per square metre: the weight of the fabric. A typical tee is 140–180 GSM. Ours start at 280 GSM, which is why they feel substantial, stay opaque and hold their shape.",
  },
  {
    q: "Will it shrink?",
    a: "All cotton pieces are pre-shrunk and enzyme or silicone washed before cutting. Wash cold and hang dry and you can expect less than 3% movement.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders ship within 1–2 business days. Domestic delivery takes 3–6 business days and international 7–14. Shipping is free on orders over $150.",
  },
  {
    q: "Can I return or exchange?",
    a: "Yes. Unworn pieces with tags can be returned or exchanged within 14 days of delivery. Start a return from our Returns page and we’ll send a label.",
  },
  {
    q: "Do you restock sold-out pieces?",
    a: "Core pieces restock a few times a year. Limited runs, like the numbered Wraith tee, never come back. Join the Séance list to hear first.",
  },
];

export default function Faq({ items = FAQS }: { items?: typeof FAQS }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((f, n) => {
        const on = open === n;
        return (
          <li key={f.q}>
            <button
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : n)}
            >
              <span className={`text-lg transition-colors sm:text-xl ${on ? "text-bone" : "text-bone/70"}`}>{f.q}</span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-mist transition-transform duration-500 ease-ghost ${on ? "rotate-45 bg-bone text-void" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div className={`grid transition-all duration-500 ease-ghost ${on ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <p className="max-w-2xl overflow-hidden text-sm leading-relaxed text-mist">{f.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
