/**
 * GHOST product catalog: the one file to edit.
 *
 * Photos: drop images into  public/products/<slug>/  (jpg, png, webp, avif).
 * They are picked up automatically and sorted by filename.
 * To tie a photo to a colour, start its filename with the colour's slug,
 * e.g.  public/products/phantom-oversized-tee/void-black-1.jpg
 * Until a folder has photos, a rendered placeholder is shown instead.
 */

export type Category = "tees" | "hoodies" | "jackets" | "pants";

export type Colorway = { name: string; hex: string };

export type Meter = {
  label: string;
  value: number; // out of 4
  note: string;
};

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number; // USD
  compareAt?: number;
  badge?: "New" | "Best seller" | "Limited";
  tagline: string;
  description: string;
  colors: Colorway[];
  sizes: string[];
  soldOut?: string[]; // sizes currently out of stock
  fabric: string;
  gsm: number;
  fit: string;
  meters: Meter[];
  details: string[];
  care: string[];
};

export const categories: { id: Category; label: string }[] = [
  { id: "tees", label: "Tees" },
  { id: "hoodies", label: "Hoodies" },
  { id: "jackets", label: "Jackets" },
  { id: "pants", label: "Pants" },
];

const BLACK = { name: "Void Black", hex: "#16191a" };
const BONE = { name: "Bone", hex: "#cfc9b9" };
const ASH = { name: "Ash", hex: "#6c706c" };
const FOG = { name: "Fog", hex: "#a5a8a2" };
const MOSS = { name: "Moss", hex: "#4a4f3c" };

export const products: Product[] = [
  {
    slug: "phantom-oversized-tee",
    name: "Phantom Oversized Tee",
    category: "tees",
    price: 48,
    badge: "Best seller",
    tagline: "The everyday ghost. Heavy, boxy, quiet.",
    description:
      "Our signature tee cut from 280 GSM combed cotton jersey. Dropped shoulders, a wide body and a cropped-long length that falls clean without clinging.",
    colors: [BLACK, BONE, ASH],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% combed cotton jersey",
    gsm: 280,
    fit: "Oversized. Size down for a regular fit",
    meters: [
      { label: "Weight", value: 3, note: "280 GSM. Structured, never see-through" },
      { label: "Softness", value: 4, note: "Enzyme-washed for a broken-in hand feel" },
      { label: "Shape hold", value: 3, note: "Pre-shrunk, keeps its boxy drape" },
    ],
    details: [
      "Tight 2×2 ribbed collar that won't bacon",
      "Dropped shoulder seam",
      "Double-needle hem and cuffs",
      "Tonal sparkle embroidery at back neck",
    ],
    care: ["Wash cold, inside out", "Hang dry", "Do not tumble dry"],
  },
  {
    slug: "apparition-boxy-tee",
    name: "Apparition Boxy Tee",
    category: "tees",
    price: 54,
    badge: "New",
    tagline: "A wider, shorter silhouette in heavyweight jersey.",
    description:
      "Built from 300 GSM cotton with a mock-neck collar and a cropped boxy body. The heaviest tee we make. It holds its shape like a shell.",
    colors: [BONE, FOG, BLACK],
    sizes: ["S", "M", "L", "XL"],
    soldOut: ["S"],
    fabric: "100% cotton heavyweight jersey",
    gsm: 300,
    fit: "Boxy. True to size",
    meters: [
      { label: "Weight", value: 4, note: "300 GSM, our heaviest jersey" },
      { label: "Softness", value: 3, note: "Silicone-washed, smooth face" },
      { label: "Shape hold", value: 4, note: "Stands off the body" },
    ],
    details: [
      "Raised mock-neck collar",
      "Cropped boxy body",
      "Side-seam woven label",
      "Garment-dyed for depth of colour",
    ],
    care: ["Wash cold with like colours", "Hang dry", "Iron inside out"],
  },
  {
    slug: "wraith-graphic-tee",
    name: "Wraith Graphic Tee",
    category: "tees",
    price: 58,
    badge: "Limited",
    tagline: "Puff-printed back graphic. Numbered run.",
    description:
      "The Phantom block with a tonal puff print across the back: a soft, raised sparkle you feel before you see. Produced in a numbered run of 300.",
    colors: [BLACK, ASH],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% combed cotton jersey",
    gsm: 280,
    fit: "Oversized. Size down for a regular fit",
    meters: [
      { label: "Weight", value: 3, note: "280 GSM jersey" },
      { label: "Print", value: 4, note: "Tonal puff print, crack-resistant" },
      { label: "Rarity", value: 4, note: "Numbered run of 300" },
    ],
    details: ["Tonal puff-print back graphic", "Numbered inner label", "Dropped shoulder", "Ribbed collar"],
    care: ["Wash cold, inside out", "Never iron the print", "Hang dry"],
  },
  {
    slug: "shroud-heavyweight-hoodie",
    name: "Shroud Heavyweight Hoodie",
    category: "hoodies",
    price: 128,
    compareAt: 148,
    badge: "Best seller",
    tagline: "480 GSM brushed fleece. A hood that actually stands.",
    description:
      "Loopback cotton fleece, brushed on the inside, with a double-layered hood that holds its shape. Dropped shoulders and a deep kangaroo pocket.",
    colors: [BLACK, ASH, BONE],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% cotton brushed fleece",
    gsm: 480,
    fit: "Oversized. True to size",
    meters: [
      { label: "Weight", value: 4, note: "480 GSM. Heavy, warm, structured" },
      { label: "Warmth", value: 4, note: "Brushed interior traps heat" },
      { label: "Softness", value: 3, note: "Gets softer every wash" },
    ],
    details: [
      "Double-layer hood, no drawcords",
      "Wide 2×2 rib cuffs and hem",
      "Deep kangaroo pocket",
      "Flatlock seams",
    ],
    care: ["Wash cold, inside out", "Lay flat to dry", "Do not tumble dry"],
  },
  {
    slug: "afterlife-zip-hoodie",
    name: "Afterlife Zip Hoodie",
    category: "hoodies",
    price: 138,
    badge: "New",
    tagline: "Two-way zip. Heavy fleece. Quiet hardware.",
    description:
      "Our heavyweight fleece in a full-zip cut with matte-black two-way hardware, a high stand on the hood and seam pockets that disappear.",
    colors: [ASH, BLACK],
    sizes: ["S", "M", "L", "XL"],
    fabric: "100% cotton brushed fleece",
    gsm: 460,
    fit: "Relaxed. True to size",
    meters: [
      { label: "Weight", value: 4, note: "460 GSM fleece" },
      { label: "Warmth", value: 3, note: "Layers under a shell" },
      { label: "Hardware", value: 4, note: "Matte two-way metal zip" },
    ],
    details: ["Two-way matte zip", "Hidden seam pockets", "Tall hood stand", "Rib cuffs and hem"],
    care: ["Close zip before washing", "Wash cold", "Lay flat to dry"],
  },
  {
    slug: "nocturne-shell-jacket",
    name: "Nocturne Shell Jacket",
    category: "jackets",
    price: 245,
    badge: "New",
    tagline: "Water-resistant tech shell for city weather.",
    description:
      "A boxy technical shell in a matte nylon ripstop with a water-repellent finish, stowaway hood and taped chest pocket.",
    colors: [BLACK, MOSS],
    sizes: ["S", "M", "L", "XL"],
    soldOut: ["XL"],
    fabric: "Nylon ripstop, DWR finish",
    gsm: 180,
    fit: "Boxy. Size up for layering",
    meters: [
      { label: "Waterproofing", value: 3, note: "Protects against light rain and snow" },
      { label: "Wind", value: 4, note: "Fully windproof shell" },
      { label: "Packability", value: 3, note: "Hood stows into the collar" },
    ],
    details: ["Stowaway hood", "Water-resistant zips", "Adjustable shock-cord hem", "Taped chest pocket"],
    care: ["Wash cold, gentle cycle", "No fabric softener", "Tumble low to refresh DWR"],
  },
  {
    slug: "veil-work-jacket",
    name: "Veil Work Jacket",
    category: "jackets",
    price: 210,
    tagline: "Washed canvas chore jacket with a boxy cut.",
    description:
      "12 oz cotton canvas, washed down for softness, with a corduroy collar, triple-stitched seams and four utility pockets.",
    colors: [BONE, BLACK],
    sizes: ["S", "M", "L", "XL"],
    fabric: "12 oz cotton canvas",
    gsm: 400,
    fit: "Boxy. True to size",
    meters: [
      { label: "Durability", value: 4, note: "Triple-stitched seams" },
      { label: "Weight", value: 3, note: "12 oz canvas" },
      { label: "Ageing", value: 4, note: "Fades beautifully over time" },
    ],
    details: ["Corduroy collar", "Four utility pockets", "Matte snap buttons", "Triple-stitched seams"],
    care: ["Wash cold, inside out", "Hang dry", "Expect natural fading"],
  },
  {
    slug: "drift-baggy-cargo",
    name: "Drift Baggy Cargo",
    category: "pants",
    price: 145,
    badge: "Best seller",
    tagline: "Wide-leg cargos that stack just right.",
    description:
      "Heavy cotton twill cut wide through the leg, with bellowed cargo pockets, an adjustable hem and a relaxed rise.",
    colors: [BLACK, MOSS, FOG],
    sizes: ["28", "30", "32", "34", "36"],
    fabric: "100% cotton twill",
    gsm: 320,
    fit: "Baggy. True to waist size",
    meters: [
      { label: "Bagginess", value: 4, note: "Wide leg, full stack at the hem" },
      { label: "Durability", value: 3, note: "Bar-tacked stress points" },
      { label: "Comfort", value: 4, note: "Relaxed rise, soft twill" },
    ],
    details: ["Bellowed cargo pockets", "Shock-cord adjustable hem", "Bar-tacked stress points", "Relaxed rise"],
    care: ["Wash cold", "Hang dry", "Iron on medium if needed"],
  },
  {
    slug: "echo-wide-sweatpant",
    name: "Echo Wide Sweatpant",
    category: "pants",
    price: 112,
    tagline: "The hoodie's other half. Wide, heavy, open hem.",
    description:
      "Matching 460 GSM fleece in a wide straight leg with an open hem, deep pockets and a flat drawcord.",
    colors: [ASH, BLACK, BONE],
    sizes: ["S", "M", "L", "XL"],
    fabric: "100% cotton brushed fleece",
    gsm: 460,
    fit: "Wide. True to size",
    meters: [
      { label: "Weight", value: 4, note: "460 GSM fleece" },
      { label: "Comfort", value: 4, note: "Brushed interior" },
      { label: "Drape", value: 3, note: "Falls straight, open hem" },
    ],
    details: ["Open wide hem", "Flat drawcord", "Deep side pockets", "Back patch pocket"],
    care: ["Wash cold, inside out", "Lay flat to dry"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(usd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: usd % 1 === 0 ? 0 : 2,
  }).format(usd);
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
