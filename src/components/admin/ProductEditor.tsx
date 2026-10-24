"use client";

import { useActionState, useState, type ReactNode } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import { categories, slugify } from "@/data/products";

const field = "h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-bone/40";
const area = "w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-bone/40";
const button = "h-11 rounded-full bg-bone px-6 text-sm text-void transition hover:bg-white disabled:opacity-50";
const ghost = "rounded-full border border-line px-4 py-2 text-xs transition hover:border-bone/40";

export type EditableProduct = {
  id: number | null;
  name: string;
  slug: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  badge: string | null;
  active: boolean;
  tagline: string;
  description: string;
  fabric: string;
  gsm: number;
  fit: string;
  details: string;
  care: string;
  sizes: string;
  colors: { name: string; hex: string }[];
  meters: { label: string; value: number; note: string }[];
};

export const EMPTY_PRODUCT: EditableProduct = {
  id: null,
  name: "",
  slug: "",
  category: "tees",
  priceCents: 0,
  compareAtCents: null,
  badge: null,
  active: false,
  tagline: "",
  description: "",
  fabric: "",
  gsm: 0,
  fit: "",
  details: "",
  care: "",
  sizes: "S,M,L,XL",
  colors: [{ name: "Void Black", hex: "#16191a" }],
  meters: [
    { label: "Weight", value: 3, note: "" },
    { label: "Softness", value: 3, note: "" },
    { label: "Shape hold", value: 3, note: "" },
  ],
};

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`grid content-start gap-1.5 text-xs text-mist ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
      {hint && <span className="text-[0.7rem] text-fog">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="glass rounded-[24px] p-6">
      <legend className="sr-only">{title}</legend>
      <p className="mb-5 font-display text-xl">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function ProductEditor({ product }: { product: EditableProduct }) {
  const [state, action, pending] = useActionState(saveProduct, {});
  const isNew = product.id === null;
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [colors, setColors] = useState(product.colors);
  const [meters, setMeters] = useState(product.meters);

  return (
    <form action={action} className="space-y-6">
      {product.id !== null && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />
      <input type="hidden" name="meters" value={JSON.stringify(meters)} />

      <Section title="Basics">
        <Field label="Name">
          <input
            name="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={field}
          />
        </Field>
        <Field label="Web address" hint={`ghost store/product/${slug || "…"}`}>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={field}
          />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={product.category} className={field}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Badge">
          <select name="badge" defaultValue={product.badge ?? ""} className={field}>
            <option value="">None</option>
            <option>New</option>
            <option>Best seller</option>
            <option>Limited</option>
          </select>
        </Field>
        <Field label="Price ($)">
          <input name="price" type="number" step="0.01" min="1" required defaultValue={product.priceCents ? product.priceCents / 100 : ""} className={field} />
        </Field>
        <Field label="Was ($)" hint="Fill in to show a sale price">
          <input name="compareAt" type="number" step="0.01" min="0" defaultValue={product.compareAtCents != null ? product.compareAtCents / 100 : ""} className={field} />
        </Field>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input name="active" type="checkbox" defaultChecked={product.active} className="h-4 w-4 accent-[#d7d2c5]" />
          Show this product on the store
          {isNew && <span className="text-xs text-fog">(tip: leave off until photos and stock are in)</span>}
        </label>
      </Section>

      <Section title="Words">
        <Field label="One-line pitch" wide>
          <input name="tagline" maxLength={160} defaultValue={product.tagline} className={field} />
        </Field>
        <Field label="Description" wide>
          <textarea name="description" rows={4} maxLength={2000} defaultValue={product.description} className={area} />
        </Field>
        <Field label="Details" hint="One per line" >
          <textarea name="details" rows={5} defaultValue={product.details} className={area} />
        </Field>
        <Field label="Care" hint="One per line">
          <textarea name="care" rows={5} defaultValue={product.care} className={area} />
        </Field>
      </Section>

      <Section title="Fabric & fit">
        <Field label="Fabric">
          <input name="fabric" maxLength={120} defaultValue={product.fabric} placeholder="100% combed cotton jersey" className={field} />
        </Field>
        <Field label="Weight (GSM)">
          <input name="gsm" type="number" min="0" step="1" defaultValue={product.gsm || ""} className={field} />
        </Field>
        <Field label="Fit" wide>
          <input name="fit" maxLength={120} defaultValue={product.fit} placeholder="Oversized. Size down for a regular fit" className={field} />
        </Field>
      </Section>

      <Section title="Sizes & colours">
        <Field label="Sizes" hint="Comma separated, in order. Removing a size removes its stock." wide>
          <input name="sizes" defaultValue={product.sizes.split(",").join(", ")} className={field} />
        </Field>
        <div className="grid gap-2 sm:col-span-2">
          <p className="text-xs text-mist">Colours (renaming a colour starts its stock at 0)</p>
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                aria-label={`${c.name || "Colour"} swatch`}
                onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
                className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-transparent"
              />
              <input
                value={c.name}
                placeholder="Colour name"
                aria-label="Colour name"
                maxLength={40}
                onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                className={field}
              />
              <button type="button" className={ghost} onClick={() => setColors(colors.filter((_, j) => j !== i))} disabled={colors.length === 1}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={`${ghost} w-fit`} onClick={() => setColors([...colors, { name: "", hex: "#6c706c" }])}>
            + Add colour
          </button>
        </div>
      </Section>

      <Section title="Quality ratings (0 to 4)">
        <div className="grid gap-2 sm:col-span-2">
          {meters.map((m, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_6rem_2fr_auto]">
              <input
                value={m.label}
                placeholder="Weight"
                aria-label="Rating name"
                onChange={(e) => setMeters(meters.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                className={field}
              />
              <select
                value={m.value}
                aria-label="Rating"
                onChange={(e) => setMeters(meters.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)))}
                className={field}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} / 4</option>
                ))}
              </select>
              <input
                value={m.note}
                placeholder="280 GSM, never see-through"
                aria-label="Rating note"
                onChange={(e) => setMeters(meters.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))}
                className={field}
              />
              <button type="button" className={ghost} onClick={() => setMeters(meters.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          {meters.length < 4 && (
            <button type="button" className={`${ghost} w-fit`} onClick={() => setMeters([...meters, { label: "", value: 3, note: "" }])}>
              + Add rating
            </button>
          )}
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-full border border-line bg-ink/90 p-2 pl-6 backdrop-blur">
        <span className="flex-1 text-sm" role="status">
          {state.error ? <span className="text-[#e8b4a0]">{state.error}</span> : state.ok ? <span className="text-mist">{state.ok}</span> : <span className="text-fog">Changes go live when you save.</span>}
        </span>
        <button className={button} disabled={pending}>{pending ? "Saving…" : isNew ? "Create product" : "Save changes"}</button>
      </div>
    </form>
  );
}
