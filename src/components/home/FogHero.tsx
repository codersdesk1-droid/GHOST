"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import GarmentArt from "../GarmentArt";
import { Sparkle, Wordmark } from "../Logo";
import "./fog-hero.css";

/**
 * "Out of the fog": a scroll-driven hero drawn in code. Scroll progress (0..1 through the
 * pinned section) is eased in a rAF loop and written to CSS variables on the stage; every
 * layer moves with transform/opacity off those variables. See docs/hero-design-package.md.
 */

// Must match the @media list in globals.css character for character.
const GATES = [
  "(max-width: 720px)",
  "(orientation: portrait) and (max-width: 1024px)",
  "(orientation: portrait) and (pointer: coarse)",
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
];

const HERO_VH = 600;
const RANGE_VH = HERO_VH - 100;
const RAMP = 20 / RANGE_VH; // 20vh edges, in progress units

const BANDS: [number, number][] = [
  [0, 0.21],
  [0.24, 0.48],
  [0.51, 0.75],
  [0.78, 1],
];

const FOG = [
  // back layers sit behind the hoodie, front layers in front of it
  { x: "8%", y: "18%", s: 70, fx: "-18vw", fy: "-40vh", o: 0.55, front: false, d: -4 },
  { x: "58%", y: "8%", s: 80, fx: "14vw", fy: "-55vh", o: 0.5, front: false, d: -13 },
  { x: "30%", y: "55%", s: 90, fx: "-8vw", fy: "-70vh", o: 0.45, front: false, d: -21 },
  { x: "62%", y: "40%", s: 75, fx: "26vw", fy: "-60vh", o: 0.75, front: true, d: -7 },
  { x: "40%", y: "70%", s: 95, fx: "-24vw", fy: "-85vh", o: 0.7, front: true, d: -17 },
  { x: "75%", y: "75%", s: 70, fx: "20vw", fy: "-95vh", o: 0.6, front: true, d: -29 },
];

const MOTES = Array.from({ length: 16 }, (_, i) => {
  // rounded so server and client render identical strings
  const r = (n: number) => Math.round(((Math.sin(i * 91.7 + n * 13.3) + 1) / 2) * 100) / 100;
  return { left: `${r(1) * 100}%`, top: `${r(2) * 100}%`, size: 1 + Math.round(r(3) * 2), delay: -Math.round(r(4) * 12), dur: 10 + Math.round(r(5) * 10) };
});

const smoothstep = (p: number, e0: number, e1: number) => {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Words({ text, base = 0, step = 0.08 }: { text: string; base?: number; step?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className="fh-w" style={{ "--th": base + i * step } as CSSProperties}>
            {w}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export default function FogHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const bands = Array.from(stage.querySelectorAll<HTMLElement>(".fh-band"));
    const cache = new Map<string, number>();

    // write a CSS variable only when it moved enough to matter
    const put = (el: HTMLElement, key: string, v: number, eps = 0.004) => {
      const id = `${bands.indexOf(el)}${key}`;
      const prev = cache.get(id);
      if (prev !== undefined && Math.abs(prev - v) < eps && v !== 0 && v !== 1) return;
      if (prev === v) return;
      cache.set(id, v);
      el.style.setProperty(key, v.toFixed(4));
    };

    let target = 0;
    let shown = 0;
    let rafId: number | null = null;
    let last = 0;
    let onScreen = true;
    let scrubOn = false;
    const loadStart = performance.now();
    let loadK = 0;

    const progress = () => {
      const r = section.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
    };

    function render(p: number) {
      put(stage, "--p", p);
      put(stage, "--h", easeOut(clamp(p / 0.8, 0, 1)));
      put(stage, "--c", smoothstep(p, 0.5, 0.86));
      put(stage, "--cue", 1 - smoothstep(p, 0.01, 0.06));
      bands.forEach((el, i) => {
        const [a, b] = BANDS[i];
        const first = i === 0;
        const lastBand = i === BANDS.length - 1;
        const op = (first ? 1 : smoothstep(p, a, a + RAMP)) * (lastBand ? 1 : 1 - smoothstep(p, b - RAMP, b));
        let k = clamp((p - a) / Math.min(0.06, (b - a) * 0.35), 0, 1);
        if (first) k = Math.max(k, loadK);
        put(el, "--o", op);
        if (i === 1) put(stage, "--b2", op);
        if (i === 2) put(stage, "--b3", op);
        put(el, "--k", k, 0.008);
      });
    }

    function tick(now: number) {
      const dt = Math.min(100, now - (last || now));
      last = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.12, dt / 16.667));
      loadK = easeOut(clamp((now - loadStart) / 1400, 0, 1));
      const settled = Math.abs(target - shown) < 0.0005 && loadK === 1;
      if (settled) shown = target;
      render(shown);
      if (settled || !onScreen) {
        rafId = null;
        last = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    const wake = () => {
      if (rafId === null && onScreen) rafId = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      target = progress();
      wake();
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      stage.classList.toggle("is-live", onScreen);
      if (onScreen && scrubOn) wake();
    });
    io.observe(section);

    function enableScrub() {
      if (scrubOn) return;
      scrubOn = true;
      cache.clear();
      stage.classList.add("is-scrub");
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
      target = shown = progress();
      wake();
    }
    function disableScrub() {
      if (!scrubOn) return;
      scrubOn = false;
      stage.classList.remove("is-scrub");
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }
    const mqls = GATES.map((q) => matchMedia(q));
    const apply = () => (mqls.some((m) => m.matches) ? disableScrub() : enableScrub());
    mqls.forEach((m) => m.addEventListener("change", apply));
    apply();

    const onVis = () => document.body.classList.toggle("paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disableScrub();
      io.disconnect();
      mqls.forEach((m) => m.removeEventListener("change", apply));
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <section ref={sectionRef} className="fh" aria-label="Ghost: out of the fog" style={{ "--hero-vh": `${HERO_VH}vh` } as CSSProperties}>
      <div ref={stageRef} className="fh-stage is-live">
        {/* environment */}
        <div className="fh-glow" aria-hidden="true" />
        <div className="fh-mark" aria-hidden="true">
          <Wordmark className="w-full" />
        </div>

        {FOG.filter((f) => !f.front).map((f, i) => (
          <Fog key={`b${i}`} {...f} />
        ))}

        {/* the piece */}
        <div className="fh-piece" aria-hidden="true">
          <div className="fh-piece-soft">
            <GarmentArt category="hoodies" color="#1e2324" id="fog-soft" className="h-full w-full" bare />
          </div>
          <div className="fh-piece-sharp">
            <GarmentArt category="hoodies" color="#1e2324" id="fog-sharp" className="h-full w-full" bare />
          </div>
          <span className="fh-chip fh-chip-1">
            <span className="fh-dot" /> 480 GSM · brushed fleece
          </span>
          <span className="fh-chip fh-chip-2">
            <span className="fh-dot" /> 2×2 rib collar · stays flat
          </span>
        </div>

        {FOG.filter((f) => f.front).map((f, i) => (
          <Fog key={`f${i}`} {...f} />
        ))}

        <div className="fh-motes" aria-hidden="true">
          {MOTES.map((m, i) => (
            <span
              key={i}
              style={{ left: m.left, top: m.top, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s` }}
            />
          ))}
        </div>
        <div className="fh-scrim" aria-hidden="true" />

        {/* captions (scrub mode) */}
        <div className="fh-copy">
          <div className="fh-band fh-b1">
            <p className="fh-label">Ghost™ · Drop 01 · AW26</p>
            <h1 className="fh-h">
              <span className="sr-only">You feel it before you see it.</span>
              <span aria-hidden="true" className="fh-soft">You feel it<br /><em>before you see it.</em></span>
              <span aria-hidden="true" className="fh-sharp">You feel it<br /><em>before you see it.</em></span>
            </h1>
          </div>
          <div className="fh-band fh-b2">
            <h2 className="fh-h fh-h-sm">
              <Words text="480 grams of brushed cotton." />
            </h2>
            <p className="fh-sub">Heavy enough to stand up on its own. Warm enough to skip the jacket.</p>
          </div>
          <div className="fh-band fh-b3">
            <h2 className="fh-h fh-h-sm">
              <Words text="Washed before it's cut." step={0.1} />
            </h2>
            <p className="fh-sub">So it&apos;s still your size after the hundredth wash. Collars stay flat. Sizes match the label.</p>
          </div>
          <div className="fh-band fh-b4">
            <p className="fh-label">Drop 01 · Out now</p>
            <h2 className="fh-h">
              <Words text="Quiet clothes" step={0.07} />
              <br />
              <em><Words text="for loud minds." base={0.14} step={0.07} /></em>
            </h2>
            <p className="fh-sub fh-settle-sub">Heavyweight oversized pieces, built to keep their shape for years.</p>
            <div className="fh-cta">
              <Link href="/shop" className="fh-btn">Shop the drop</Link>
              <Link href="/quality" className="fh-link">See how it&apos;s made</Link>
            </div>
          </div>

          {/* static hero (phones, portrait tablets, reduced motion) */}
          <div className="fh-static">
            <p className="fh-label">Drop 01 · AW26</p>
            <h1 className="fh-h">Quiet clothes<br /><em>for loud minds.</em></h1>
            <p className="fh-sub">Heavyweight oversized pieces, built to keep their shape for years.</p>
            <div className="fh-cta">
              <Link href="/shop" className="fh-btn">Shop the drop</Link>
            </div>
          </div>
        </div>

        <div className="fh-cue" aria-hidden="true">
          <span>Scroll</span>
          <Sparkle className="h-2.5 w-2.5" />
        </div>
      </div>
    </section>
  );
}

function Fog({ x, y, s, fx, fy, o, front, d }: (typeof FOG)[number]) {
  return (
    <div
      className={`fh-fog ${front ? "fh-fog-front" : ""}`}
      aria-hidden="true"
      style={{ left: x, top: y, width: `${s}vw`, height: `${s * 0.6}vw`, "--fx": fx, "--fy": fy, "--fo": o } as CSSProperties}
    >
      <span style={{ animationDelay: `${d}s` }} />
    </div>
  );
}
