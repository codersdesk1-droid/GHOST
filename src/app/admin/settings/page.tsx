import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/admin/SettingsForms";
import { requireOwner } from "@/lib/auth";
import { settingsFromRow } from "@/lib/settings";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Store settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-mist">Loading…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireOwner();
  // Read straight from the database (not the cache) so the form always shows what's saved.
  const settings = settingsFromRow(await db.orm.public.StoreSettings.first({ id: 1 }));
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-5xl font-light">Store settings</h1>
      <p className="mt-3 mb-8 text-sm text-mist">Your business details, shipping prices and policy pages.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
