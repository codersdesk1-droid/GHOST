import "server-only";
import { db } from "@/prisma/db";

export type Limit = { limit: number; windowSeconds: number };

/**
 * Fixed-window rate limiting shared by every server instance: one atomic upsert in
 * Postgres per check. Fails open (allows the request) if the database is unreachable,
 * because the request itself would need the database anyway.
 */
export async function rateLimit(name: string, client: string, { limit, windowSeconds }: Limit) {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSeconds);
  const expiresAt = (window + 1) * windowSeconds;
  const key = `${name}:${client}:${windowSeconds}:${window}`;

  try {
    const [row] = await db.query(
      db.raw.sql`INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt})
        ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimit"."count" + 1
        RETURNING "count"`
        .returnsRow({ count: "pg/int4@1" })
        .build(),
    );
    // Sweep expired counters now and then so the table stays tiny.
    if (Math.random() < 0.02) {
      await db.execute(db.raw.sql`DELETE FROM "RateLimit" WHERE "expiresAt" < ${now}`.affectedCount().build());
    }
    const count = row?.count ?? 0;
    return { ok: count <= limit, retryAfter: expiresAt - now };
  } catch (e) {
    console.error("[rate-limit] check failed, allowing request", e);
    return { ok: true, retryAfter: 0 };
  }
}

/** Check several windows (e.g. per minute and per hour); the first one exceeded wins. */
export async function rateLimitAll(name: string, client: string, limits: Limit[]) {
  for (const l of limits) {
    const r = await rateLimit(name, client, l);
    if (!r.ok) return r;
  }
  return { ok: true, retryAfter: 0 };
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfter)) } },
  );
}
