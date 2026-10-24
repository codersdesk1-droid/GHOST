import type { Metadata } from "next";
import Link from "next/link";
import Anatomy from "@/components/home/Anatomy";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Quality",
  description: "Heavyweight fabric, pre-shrunk cotton and double-needle construction — how Ghost pieces are made.",
};

const WEIGHTS = [
  { label: "Fast-fashion tee", gsm: 140 },
  { label: "Standard tee", gsm: 180 },
  { label: "Ghost Phantom tee", gsm: 280, ours: true },
  { label: "Ghost Apparition tee", gsm: 300, ours: true },
  { label: "Ghost Shroud hoodie", gsm: 480, ours: true },
];

const STEPS = [
  ["Fabric", "Long-staple combed cotton, knitted heavy and dense so it stays opaque and holds a shape."],
  ["Wash", "Enzyme and silicone washes before cutting — pre-shrunk, and soft from the first wear."],
  ["Cut", "Patterns built for drape: dropped shoulders, wide bodies, boxy lengths."],
  ["Stitch", "Double-needle hems, flatlock seams and bar-tacks wherever stress lands."],
  ["Check", "Every piece is hand-inspected and measured before it's folded."],
];

export default function QualityPage() {
  const max = Math.max(...WEIGHTS.map((w) => w.gsm));
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-36 sm:px-10">
      <p className="eyebrow">Quality</p>
      <h1 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-light">
        Made heavy. <em className="text-bone/50">Made to stay.</em>
      </h1>

      <section className="mt-24 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <h2 className="font-display text-4xl">The weight test</h2>
          <p className="mt-4 max-w-sm text-mist">
            Fabric weight (GSM) is the clearest sign of quality you can&apos;t see in a photo. Here&apos;s how ours compares.
          </p>
        </Reveal>
        <div className="space-y-5">
          {WEIGHTS.map((w, n) => (
            <Reveal key={w.label} delay={n * 80}>
              <div className="flex items-baseline justify-between text-sm">
                <span className={w.ours ? "text-bone" : "text-mist"}>{w.label}</span>
                <span className="tabular-nums text-mist">{w.gsm} GSM</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${w.ours ? "bg-bone" : "bg-fog"}`}
                  style={{ width: `${(w.gsm / max) * 100}%` }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-32">
        <Anatomy />
      </section>

      <section className="mt-32">
        <h2 className="font-display text-4xl sm:text-5xl">From yarn to you</h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([t, b], n) => (
            <Reveal as="li" key={t} delay={n * 90} className="glass rounded-[28px] p-6">
              <span className="text-xs text-mist">0{n + 1}</span>
              <p className="mt-10 font-display text-2xl">{t}</p>
              <p className="mt-3 text-sm leading-relaxed text-mist">{b}</p>
            </Reveal>
          ))}
        </ol>
        <Link href="/shop" className="mt-14 inline-flex rounded-full bg-bone px-8 py-4 text-void transition hover:bg-white">
          Feel it yourself
        </Link>
      </section>
    </div>
  );
}
