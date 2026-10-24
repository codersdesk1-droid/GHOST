import 'server-only';
import { Pool } from 'pg';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

function createDb() {
  // Prisma Postgres caps direct connections (10 on Free, 5 reserved), so each
  // function instance keeps a small pool instead of the driver default of 10.
  const pool = new Pool({
    connectionString: process.env['DATABASE_URL']?.replace('sslmode=require', 'sslmode=verify-full'),
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
  });
  return postgres({ contract, pg: pool });
}

// One client per process; reused across hot reloads in development.
const globalForDb = globalThis as unknown as { ghostDb?: ReturnType<typeof createDb> };
export const db = globalForDb.ghostDb ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.ghostDb = db;
