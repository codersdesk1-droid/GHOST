"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { ActionState } from "@/app/admin/actions";
import { DEFAULT_SETTINGS } from "@/data/defaults";
import { envOwners, requireOwner, ROLES, type Role } from "@/lib/auth";
import { SETTINGS_TAG } from "@/lib/settings";
import { db } from "@/prisma/db";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireOwner();
  const shipping = Number(form.get("shipping"));
  const freeOver = Number(form.get("freeOver"));
  const contactEmail = text(form, "contactEmail", 120);

  const storeName = text(form, "storeName", 40);
  if (!storeName) return { error: "The store needs a name." };
  if (contactEmail && !EMAIL.test(contactEmail)) return { error: "That contact email doesn't look right." };
  if (!Number.isFinite(shipping) || shipping < 0 || shipping > 500) return { error: "Shipping must be between $0 and $500." };
  if (!Number.isFinite(freeOver) || freeOver < 0 || freeOver > 100_000) return { error: "Free shipping threshold looks off." };

  const data = {
    storeName,
    tagline: text(form, "tagline", 80),
    contactEmail,
    instagram: text(form, "instagram", 60).replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, ""),
    announcement: text(form, "announcement", 120),
    shippingCents: Math.round(shipping * 100),
    freeShippingCents: Math.round(freeOver * 100),
    policyShipping: text(form, "policyShipping", 4000),
    policyReturns: text(form, "policyReturns", 4000),
    policyPrivacy: text(form, "policyPrivacy", 4000),
    policyTerms: text(form, "policyTerms", 4000),
    policyContact: text(form, "policyContact", 4000),
  };

  const exists = await db.orm.public.StoreSettings.first({ id: 1 });
  if (exists) await db.orm.public.StoreSettings.where({ id: 1 }).update(data);
  else await db.orm.public.StoreSettings.create({ id: 1, ...DEFAULT_SETTINGS, ...data });

  updateTag(SETTINGS_TAG);
  revalidatePath("/", "layout"); // header, footer and bag read these on every page
  return { ok: "Saved. The store shows the new details now." };
}

export async function addStaff(_: ActionState, form: FormData): Promise<ActionState> {
  await requireOwner();
  const email = text(form, "email", 120).toLowerCase();
  const role = text(form, "role", 10) as Role;
  if (!EMAIL.test(email)) return { error: "Enter a valid email address." };
  if (!ROLES.includes(role)) return { error: "Pick a role." };
  if (envOwners().includes(email)) return { error: "That person is already a permanent owner." };

  const existing = await db.orm.public.StaffMember.first({ email });
  if (existing) await db.orm.public.StaffMember.where({ id: existing.id }).update({ role });
  else await db.orm.public.StaffMember.create({ email, role });
  revalidatePath("/admin/staff");
  return { ok: `${email} can now sign in to the admin as ${role}. They must sign in with this email and verify it.` };
}

export async function removeStaff(input: { id: number }) {
  await requireOwner();
  if (!Number.isInteger(input?.id) || input.id <= 0) throw new Error("Bad staff id");
  await db.orm.public.StaffMember.where({ id: input.id }).delete();
  revalidatePath("/admin/staff");
}
