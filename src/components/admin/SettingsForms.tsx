"use client";

import { useActionState, useTransition, type ReactNode } from "react";
import { addStaff, removeStaff, saveSettings } from "@/app/admin/settings/actions";
import type { StoreSettingsData } from "@/data/defaults";

const field = "h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-bone/40";
const area = "w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-bone/40";
const button = "h-11 rounded-full bg-bone px-6 text-sm text-void transition hover:bg-white disabled:opacity-50";

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`grid content-start gap-1.5 text-xs text-mist ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
      {hint && <span className="text-[0.7rem] text-fog">{hint}</span>}
    </label>
  );
}

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="glass rounded-[24px] p-6">
      <p className="font-display text-xl">{title}</p>
      {note && <p className="mt-1 text-xs text-mist">{note}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ settings: s }: { settings: StoreSettingsData }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  return (
    <form action={action} className="space-y-6">
      <Card title="Business">
        <Field label="Store name" hint="Used in emails, the footer and page titles">
          <input name="storeName" required maxLength={40} defaultValue={s.storeName} className={field} />
        </Field>
        <Field label="Tagline">
          <input name="tagline" maxLength={80} defaultValue={s.tagline} className={field} />
        </Field>
        <Field label="Contact email" hint="Shown to customers; replies to order emails go here">
          <input name="contactEmail" type="email" maxLength={120} defaultValue={s.contactEmail} className={field} />
        </Field>
        <Field label="Instagram handle">
          <input name="instagram" maxLength={60} defaultValue={s.instagram} placeholder="yourbrand" className={field} />
        </Field>
        <Field label="Announcement bar" hint="Short line at the top of every page. Leave empty to hide." wide>
          <input name="announcement" maxLength={120} defaultValue={s.announcement} placeholder="Free shipping over $150 · Drop 02 lands Friday" className={field} />
        </Field>
      </Card>

      <Card title="Shipping" note="Charged at checkout. Stripe collects the address.">
        <Field label="Shipping price ($)">
          <input name="shipping" type="number" step="0.01" min="0" defaultValue={s.shippingCents / 100} className={field} />
        </Field>
        <Field label="Free shipping on orders over ($)" hint="Set 0 for always free">
          <input name="freeOver" type="number" step="0.01" min="0" defaultValue={s.freeShippingCents / 100} className={field} />
        </Field>
      </Card>

      <Card title="Policy pages" note="One point per line. Have these checked before you take real orders.">
        <Field label="Shipping"><textarea name="policyShipping" rows={5} defaultValue={s.policyShipping} className={area} /></Field>
        <Field label="Returns & exchanges"><textarea name="policyReturns" rows={5} defaultValue={s.policyReturns} className={area} /></Field>
        <Field label="Privacy"><textarea name="policyPrivacy" rows={5} defaultValue={s.policyPrivacy} className={area} /></Field>
        <Field label="Terms"><textarea name="policyTerms" rows={5} defaultValue={s.policyTerms} className={area} /></Field>
        <Field label="Contact page" hint="Your email and Instagram are added automatically" wide>
          <textarea name="policyContact" rows={3} defaultValue={s.policyContact} className={area} />
        </Field>
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-full border border-line bg-ink/90 p-2 pl-6 backdrop-blur">
        <span className="flex-1 text-sm" role="status">
          {state.error ? <span className="text-[#e8b4a0]">{state.error}</span> : state.ok ? <span className="text-mist">{state.ok}</span> : <span className="text-fog">Changes go live when you save.</span>}
        </span>
        <button className={button} disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}

export function AddStaffForm() {
  const [state, action, pending] = useActionState(addStaff, {});
  return (
    <form action={action} className="glass rounded-[24px] p-6">
      <p className="font-display text-xl">Add someone</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <Field label="Their email">
          <input name="email" type="email" required className={field} placeholder="name@example.com" />
        </Field>
        <Field label="Role">
          <select name="role" defaultValue="staff" className={field}>
            <option value="staff">Staff: products, stock, orders</option>
            <option value="owner">Owner: everything</option>
          </select>
        </Field>
        <button className={button} disabled={pending}>{pending ? "Adding…" : "Add"}</button>
      </div>
      {(state.ok || state.error) && (
        <p role="status" className={`mt-3 text-sm ${state.error ? "text-[#e8b4a0]" : "text-mist"}`}>{state.error ?? state.ok}</p>
      )}
    </form>
  );
}

export function RemoveStaffButton({ id, email }: { id: number; email: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`Remove ${email} from the admin?`) && start(() => removeStaff({ id }))}
      className="rounded-full border border-line px-4 py-1.5 text-xs transition hover:border-[#e8b4a0]/60 hover:text-[#e8b4a0] disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
