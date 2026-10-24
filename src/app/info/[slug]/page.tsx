import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Placeholder policy copy — have these reviewed before taking real orders.
const PAGES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping",
    body: [
      "Orders ship within 1–2 business days from our studio.",
      "Domestic delivery: 3–6 business days. International: 7–14 business days.",
      "Shipping is free on orders over $150; otherwise a flat $12 applies.",
      "You'll receive a tracking link by email as soon as your parcel leaves us.",
    ],
  },
  returns: {
    title: "Returns & exchanges",
    body: [
      "Unworn, unwashed pieces with original tags can be returned within 14 days of delivery.",
      "Exchanges for a different size or colour are free, subject to stock.",
      "Limited and numbered pieces are final sale unless faulty.",
      "Refunds are issued to the original payment method within 5–7 business days of us receiving your return.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "Email: hello@ghost.store — we reply within one business day.",
      "Instagram: @ghost — DMs open for styling questions.",
      "For order issues, include your order number so we can help faster.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "We collect only what we need to fulfil your order and, if you opt in, to email you about drops.",
      "We never sell your data. Payment details are handled by our payment provider and never stored by us.",
      "You can request a copy or deletion of your data at any time by emailing hello@ghost.store.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Prices are listed in US dollars and may change between drops.",
      "Orders are confirmed only after payment is verified.",
      "Colours may vary slightly from what you see on screen.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: PAGES[slug]?.title };
}

export default function InfoPage(props: PageProps<"/info/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Info params={props.params} />
    </Suspense>
  );
}

async function Info({ params }: { params: PageProps<"/info/[slug]">["params"] }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 pt-36 sm:px-10">
      <p className="eyebrow">Ghost™</p>
      <h1 className="mt-4 font-display text-6xl font-light">{page.title}</h1>
      <ul className="mt-12 space-y-6 border-t border-line pt-10">
        {page.body.map((b) => (
          <li key={b} className="flex gap-4 text-lg leading-relaxed text-bone/80">
            <span className="mt-1 text-xs text-mist">✦</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
