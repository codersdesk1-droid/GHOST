"use client";

import { useState } from "react";
import GarmentArt from "../GarmentArt";

const POINTS = [
  { x: 50, y: 15, title: "2×2 ribbed collar", body: "Tight rib with spandex memory. It lies flat after a hundred washes — no bacon neck." },
  { x: 20, y: 22, title: "Dropped shoulder", body: "Seam sits 6 cm below the shoulder for that slouched, oversized line." },
  { x: 62, y: 52, title: "280–300 GSM cotton", body: "Nearly twice the weight of a standard tee. Opaque, structured, never clingy." },
  { x: 40, y: 81, title: "Double-needle hem", body: "Two parallel stitch lines on every hem and cuff, so nothing twists or rolls." },
];

export default function Anatomy() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] rounded-[32px] bg-gradient-to-b from-smoke to-void ring-1 ring-line">
        <GarmentArt category="tees" color="#1d2122" id="anatomy" className="absolute inset-0 m-auto h-[86%] w-[86%]" />
        {POINTS.map((pt, n) => (
          <button
            key={pt.title}
            aria-label={pt.title}
            aria-pressed={active === n}
            onClick={() => setActive(n)}
            onMouseEnter={() => setActive(n)}
            className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          >
            <span
              className={`relative grid h-6 w-6 place-items-center rounded-full text-[0.65rem] transition-all duration-500 ${
                active === n ? "pulse-ring bg-bone text-void" : "glass text-bone"
              }`}
            >
              {n + 1}
            </span>
          </button>
        ))}
      </div>

      <ol className="space-y-2">
        {POINTS.map((pt, n) => (
          <li key={pt.title}>
            <button
              onClick={() => setActive(n)}
              className={`w-full rounded-3xl p-6 text-left transition-all duration-500 ease-ghost ${active === n ? "glass" : "opacity-50 hover:opacity-80"}`}
            >
              <span className="flex items-baseline gap-4">
                <span className="text-xs text-mist tabular-nums">0{n + 1}</span>
                <span className="font-display text-2xl sm:text-3xl">{pt.title}</span>
              </span>
              <span
                className={`grid transition-all duration-500 ease-ghost ${active === n ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <span className="overflow-hidden pl-9 text-sm leading-relaxed text-mist">{pt.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
