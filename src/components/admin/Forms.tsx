"use client";

import { useActionState, type ReactNode } from "react";
import { updateOrder, updateProduct, updateStock, type ActionState } from "@/app/admin/actions";

const field = "h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-bone/40";
const button = "h-10 rounded-full bg-bone px-5 text-sm text-void transition hover:bg-white disabled:opacity-50";

function Status({ state }: { state: ActionState }) {
  if (state.error) return <span role="alert" className="text-xs text-[#e8b4a0]">{state.error}</span>;
  if (state.ok) return <span role="status" className="text-xs text-mist">{state.ok}</span>;
  return null;
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs text-mist">
      {text}
      {children}
    </label>
  );
}

export function ProductForm({
  product,
}: {
  product: { id: number; name: string; priceCents: number; compareAtCents: number | null; badge: string | null; active: boolean };
}) {
  const [state, action, pending] = useActionState(updateProduct, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={product.id} />
      <Label text="Name">
        <input name="name" defaultValue={product.name} className={field} required maxLength={80} />
      </Label>
      <Label text="Price ($)">
        <input name="price" type="number" step="0.01" min="1" defaultValue={product.priceCents / 100} className={field} required />
      </Label>
      <Label text="Was ($, for sales)">
        <input name="compareAt" type="number" step="0.01" min="0" defaultValue={product.compareAtCents != null ? product.compareAtCents / 100 : ""} className={field} />
      </Label>
      <Label text="Badge">
        <select name="badge" defaultValue={product.badge ?? ""} className={field}>
          <option value="">None</option>
          <option>New</option>
          <option>Best seller</option>
          <option>Limited</option>
        </select>
      </Label>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={product.active} className="h-4 w-4 accent-[#d7d2c5]" />
          On sale
        </label>
        <button className={button} disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </div>
      <div className="sm:col-span-5"><Status state={state} /></div>
    </form>
  );
}

export function StockForm({
  productId,
  colors,
  sizes,
  variants,
}: {
  productId: number;
  colors: string[];
  sizes: string[];
  variants: { id: number; color: string; size: string; stock: number }[];
}) {
  const [state, action, pending] = useActionState(updateStock, {});
  return (
    <form action={action} className="mt-5">
      <input type="hidden" name="productId" value={productId} />
      <div className="overflow-x-auto">
        <table className="text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs text-mist">
              <th className="pr-4 pb-2 font-normal">Stock</th>
              {sizes.map((s) => (
                <th key={s} className="px-1 pb-2 font-normal">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((c) => (
              <tr key={c}>
                <td className="py-1 pr-4 whitespace-nowrap text-bone/80">{c}</td>
                {sizes.map((s) => {
                  const v = variants.find((x) => x.color === c && x.size === s);
                  return (
                    <td key={s} className="px-1 py-1">
                      {v ? (
                        <input
                          name={`stock-${v.id}`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={v.stock}
                          aria-label={`${c} ${s} stock`}
                          className={`${field} w-16 text-center ${v.stock === 0 ? "border-[#e8b4a0]/50" : ""}`}
                        />
                      ) : (
                        <span className="block w-16 text-center text-fog">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button className={button} disabled={pending}>{pending ? "Saving…" : "Save stock"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function OrderForm({ id, status, trackingNumber, statuses }: { id: number; status: string; trackingNumber: string | null; statuses: readonly string[] }) {
  const [state, action, pending] = useActionState(updateOrder, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <Label text="Status">
        <select name="status" defaultValue={status} className={field}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </Label>
      <Label text="Tracking number">
        <input name="trackingNumber" defaultValue={trackingNumber ?? ""} className={`${field} w-56`} maxLength={80} />
      </Label>
      <button className={button} disabled={pending}>{pending ? "Saving…" : "Update"}</button>
      <Status state={state} />
    </form>
  );
}
