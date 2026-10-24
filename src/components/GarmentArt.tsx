import type { Category } from "@/data/products";

/**
 * Studio-lit garment silhouette used as a placeholder until real photos
 * are added. Pure SVG so it stays crisp at any size.
 */

const SHAPES: Record<Category, { body: string; extra?: string; inner?: string; lines: string[] }> = {
  tees: {
    body: "M118 72 Q158 58 174 56 Q200 84 226 56 Q242 58 282 72 L362 124 L332 206 L294 188 L296 444 Q200 458 104 444 L106 188 L68 206 L38 124 Z",
    lines: [
      "M174 56 Q200 96 226 56",
      "M106 188 L118 74",
      "M294 188 L282 74",
      "M150 250 Q170 330 160 430",
      "M250 240 Q236 320 246 432",
      "M108 432 Q200 446 294 432",
    ],
  },
  hoodies: {
    extra: "M146 104 Q136 40 200 32 Q264 40 254 104 Q200 130 146 104 Z",
    inner: "M172 100 Q172 62 200 56 Q228 62 228 100 Q200 114 172 100 Z",
    body: "M158 88 Q200 118 242 88 L292 98 Q334 112 348 164 L376 336 L340 346 L314 214 L302 220 L302 444 Q200 458 98 444 L98 220 L86 214 L60 346 L24 336 L52 164 Q66 112 108 98 Z",
    lines: [
      "M158 88 Q200 124 242 88",
      "M136 346 L264 346 L288 414 L112 414 Z",
      "M98 420 Q200 434 302 420",
      "M28 322 L62 332",
      "M372 322 L338 332",
      "M190 118 L186 190",
      "M210 118 L214 186",
    ],
  },
  jackets: {
    extra: "M162 60 L238 60 L244 100 L200 116 L156 100 Z",
    body: "M156 96 L200 114 L244 96 L292 104 Q334 116 348 166 L374 340 L338 348 L314 218 L304 222 L304 446 Q200 458 96 446 L96 222 L86 218 L62 348 L26 340 L52 166 Q66 116 108 104 Z",
    lines: [
      "M200 114 L200 452",
      "M124 166 L176 166 L176 214 L124 214 Z",
      "M224 166 L276 166 L276 214 L224 214 Z",
      "M118 320 L176 320 L176 390 L118 390 Z",
      "M224 320 L282 320 L282 390 L224 390 Z",
      "M96 434 Q200 446 304 434",
    ],
  },
  pants: {
    body: "M122 36 L278 36 L292 72 L336 444 Q300 458 254 452 L210 168 L200 156 L190 168 L146 452 Q100 458 64 444 L108 72 Z",
    lines: [
      "M108 72 L292 72",
      "M200 72 L200 156",
      "M92 252 L146 248 L150 334 L96 340 Z",
      "M308 252 L254 248 L250 334 L304 340 Z",
      "M150 100 Q160 140 148 170",
      "M250 100 Q240 140 252 170",
      "M70 430 Q104 440 146 438",
      "M254 438 Q296 440 330 430",
    ],
  },
};

export default function GarmentArt({
  category,
  color,
  className = "",
  id,
}: {
  category: Category;
  color: string;
  className?: string;
  id: string;
}) {
  const s = SHAPES[category];
  const light = `light-${id}`;
  const glow = `glow-${id}`;
  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-hidden="true">
      <defs>
        <radialGradient id={glow} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#d7d2c5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#d7d2c5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={light} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${glow})`} />
      <ellipse cx="200" cy="474" rx="150" ry="10" fill="#000" opacity="0.45" />
      <g>
        {s.extra && <path d={s.extra} fill={color} />}
        {s.extra && <path d={s.extra} fill={`url(#${light})`} />}
        {s.inner && <path d={s.inner} fill="#000" opacity="0.45" />}
        <path d={s.body} fill={color} />
        <path d={s.body} fill={`url(#${light})`} />
        <g fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round">
          {s.lines.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1">
          <path d={s.body} />
        </g>
        {/* the GHOST sparkle */}
        <path
          d="M200 150 C201 160 204 163 214 164 C204 165 201 168 200 178 C199 168 196 165 186 164 C196 163 199 160 200 150 Z"
          fill="#d7d2c5"
          opacity={category === "pants" ? 0 : 0.5}
        />
      </g>
    </svg>
  );
}
