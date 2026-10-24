# GHOST hero: design package ("Out of the fog")

Tier 1, single journey. No generated footage: the scene is drawn in code (SVG + CSS layers driven by scroll),
so it costs zero credits. Deliberate deviation from the 10K skill, which assumes a Higgsfield video.

## 1. Brand premise

**Ghost: you feel it before you see it.** Quality you cannot judge in a photo (weight, a collar that stays flat,
a size that stays your size) is the one idea. The hoodie appears out of fog the way the quality reveals itself:
slowly, then all at once. Every caption answers a real buyer complaint: tight or wavy necks, shrinking after a
wash, see-through fabric, sizes that do not match the label, cuts that hang wrong.

## 2. Palette tokens (already in `globals.css`)

```css
:root{
  --canvas:#0d1010;        /* --void, tinted green-grey, never pure black */
  --panel:#1b2020;         /* --smoke */
  --accent:#d7d2c5;        /* --bone: CTA and rare emphasis */
  --accent-hover:#ffffff;
  --accent-muted:rgb(215 210 197 / .12); /* --line, fog tint, particles */
  --text-secondary:#8d918c;/* --mist */
  --text-primary:#d7d2c5;
}
```

## 3. Type trio

- Display: Fraunces (SOFT axis 100, light 300, italic for the second line)
- Body: Jost 400/500
- Mono: IBM Plex Mono 400 for chips and small labels

## 4. Band map (hero 600vh, scroll range 500vh, ramps 20vh)

| Band | Range (starting point) | Scene moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.21 | Thick fog, the hoodie a faint shape deep in the mist | "You feel it" / "before you see it." | Blur-to-sharp (mist clearing), load ramp |
| 2 | 0.24 to 0.48 | The hoodie approaches through thinning fog. Chip on the chest: "480 GSM · brushed fleece" | "480 grams of brushed cotton." / "Heavy enough to stand up on its own. Warm enough to skip the jacket." | Approach-from-depth |
| 3 | 0.51 to 0.75 | Fog drifts down and away. Chip on the collar: "2×2 rib collar · stays flat" | "Washed before it's cut." / "So it's still your size after the hundredth wash. Collars stay flat. Sizes match the label." | Drift-down (fog falling away) |
| 4 | 0.78 to 1.00 | Fog cleared, hoodie at rest, wordmark ghosted behind | "Quiet clothes" / "for loud minds." / "Heavyweight oversized pieces, built to keep their shape for years." / CTA "Shop the drop" + "See how it's made" | Word rise into a staged settle |

Text lives in the left column; the hoodie owns the right half (the action lane).

## 5. Static-hero copy (phones, portrait tablets, reduced motion)

Eyebrow "Drop 01 · AW26". Headline "Quiet clothes for loud minds." Subline "Heavyweight oversized pieces, built to
keep their shape for years." CTA "Shop the drop". Shown over the settled scene (fog cleared, hoodie at rest).

## 6. Below the hero (existing sections, unchanged order)

Marquee → category tabs + product strip → "You feel it before you see it" anatomy (the one interactive moment:
tap the points on the tee) → manifesto → Most worn → FAQ → footer + Séance list. Single CTA: shop the drop.

## 7. Vector layer

Hand-drawn SVG hoodie (GarmentArt), six fog layers (back and front) with slow ambient drift, 16 dust motes at
whisper level, the GHOST sparkle on the chest. Reduced motion: final states, no drift.

## 8. Engineering list

dt-normalized lerp in a rAF loop that rests and stops off-screen, delta-gated CSS variable writes, band pacing
in vh with smoothstep ramps, flick test, four-layer legibility (base scrim, per-band scrim, text shadow token,
chips), five static-hero gates identical in CSS and JS and live via change listeners, transform/opacity only.

## 9. Copy gate

Every line above ships verbatim. The built site must pass the grep gate: zero em dashes, zero stock words
(leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), and the AI-tell sweep.
