import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_SETTINGS, type StoreSettingsData } from "@/data/defaults";
import { db } from "@/prisma/db";

export const SETTINGS_TAG = "settings";

/** Business details edited in /admin/settings (falls back to the defaults). */
export async function getSettings(): Promise<StoreSettingsData> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  return settingsFromRow(await db.orm.public.StoreSettings.first({ id: 1 }));
}

/** The editable fields of the settings row, or the defaults when there is no row yet. */
export function settingsFromRow(row: (StoreSettingsData & { id: number; updatedAt: string }) | null): StoreSettingsData {
  if (!row) return DEFAULT_SETTINGS;
  const settings: Partial<typeof row> = { ...row };
  delete settings.id;
  delete settings.updatedAt;
  return settings as StoreSettingsData;
}
