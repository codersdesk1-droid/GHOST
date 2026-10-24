import type { Metadata } from "next";
import { Suspense } from "react";
import { AddStaffForm, RemoveStaffButton } from "@/components/admin/SettingsForms";
import { envOwners, requireOwner } from "@/lib/auth";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Staff" };

export default function StaffPage() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Staff />
    </Suspense>
  );
}

async function Staff() {
  await requireOwner();
  const members = await db.orm.public.StaffMember.orderBy((s) => s.id.asc()).all();
  const permanent = envOwners();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-5xl font-light">Staff</h1>
        <p className="mt-3 text-sm text-mist">
          Staff can edit products, photos and stock, and handle orders. Owners can also change store settings and manage
          staff. People sign in with their own account using the email you add here.
        </p>
      </div>

      <AddStaffForm />

      <ul className="divide-y divide-line rounded-[24px] border border-line">
        {permanent.map((email) => (
          <li key={email} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span>{email}</span>
            <span className="text-xs text-mist">Owner · permanent (set on the server)</span>
          </li>
        ))}
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span>{m.email}</span>
            <span className="flex items-center gap-4">
              <span className="text-xs text-mist capitalize">{m.role}</span>
              <RemoveStaffButton id={m.id} email={m.email} />
            </span>
          </li>
        ))}
        {permanent.length + members.length === 0 && <li className="p-4 text-sm text-mist">No one yet.</li>}
      </ul>
    </div>
  );
}
