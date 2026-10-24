import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/prisma/db";

export type Role = "owner" | "staff";
export const ROLES: Role[] = ["owner", "staff"];

/** Emails in ADMIN_EMAILS (comma separated) are always owners, so the store can never lock itself out. */
export function envOwners() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The signed-in person's verified emails, lowercased. */
async function verifiedEmails() {
  const user = await currentUser();
  return (user?.emailAddresses ?? [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
}

/** owner, staff, or null for customers and signed-out visitors. */
export async function getRole(): Promise<Role | null> {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return null;
  const emails = await verifiedEmails();
  if (emails.length === 0) return null;

  const owners = envOwners();
  if (emails.some((e) => owners.includes(e))) return "owner";

  const members = await db.orm.public.StaffMember.where((s) => s.email.in(emails)).all();
  if (members.some((m) => m.role === "owner")) return "owner";
  return members.length ? "staff" : null;
}

/**
 * Gate for admin pages and server actions. Signed-out visitors go to sign-in;
 * signed-in people without the role get a 404 so the admin area stays invisible.
 */
async function requireRole(allowed: Role[]) {
  const { isAuthenticated, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();
  const role = await getRole();
  if (!role || !allowed.includes(role)) notFound();
  return role;
}

/** Products, stock and orders: owners and staff. */
export const requireStaff = () => requireRole(["owner", "staff"]);
/** Store settings and staff management: owners only. */
export const requireOwner = () => requireRole(["owner"]);
