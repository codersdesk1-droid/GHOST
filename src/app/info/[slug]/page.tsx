import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { POLICY_PAGES } from "@/data/defaults";
import { getSettings } from "@/lib/settings";

// Policy text is edited in /admin/settings. Have it reviewed before taking real orders.
type Slug = keyof typeof POLICY_PAGES;
const isSlug = (s: string): s is Slug => s in POLICY_PAGES;

export function generateStaticParams() {
  return Object.keys(POLICY_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: isSlug(slug) ? POLICY_PAGES[slug].title : undefined };
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
  if (!isSlug(slug)) notFound();
  const page = POLICY_PAGES[slug];
  const s = await getSettings();
  const lines = s[page.field].split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (slug === "contact") {
    if (s.instagram) lines.unshift(`Instagram: @${s.instagram.replace(/^@/, "")}`);
    if (s.contactEmail) lines.unshift(`Email: ${s.contactEmail}`);
  }
  return (
    <div className="mx-auto max-w-3xl px-5 pt-36 sm:px-10">
      <p className="eyebrow">{s.storeName}™</p>
      <h1 className="mt-4 font-display text-6xl font-light">{page.title}</h1>
      <ul className="mt-12 space-y-6 border-t border-line pt-10">
        {lines.map((b) => (
          <li key={b} className="flex gap-4 text-lg leading-relaxed text-bone/80">
            <span className="mt-1 text-xs text-mist">✦</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
