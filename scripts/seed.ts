// Sync products and variants from src/data/products.ts into the database.
// Only adds what is missing: prices and stock edited in /admin are never overwritten.
// Run: npm run db:seed
import { config } from 'dotenv';
import { Pool } from 'pg';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from '../src/prisma/contract.d.ts';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };
import { products, slugify } from '../src/data/products.ts';

config({ path: ['.env.local', '.env'], quiet: true });

const STARTING_STOCK = 24;

const db = postgres({
  contract: contractFromJson<Contract>(contractJson),
  pg: new Pool({ connectionString: process.env['DATABASE_URL']?.replace('sslmode=require', 'sslmode=verify-full'), max: 2 }),
});

let addedProducts = 0;
let addedVariants = 0;

for (const p of products) {
  let row = await db.orm.public.Product.first({ slug: p.slug });
  if (!row) {
    row = await db.orm.public.Product.create({
      slug: p.slug,
      name: p.name,
      priceCents: Math.round(p.price * 100),
      compareAtCents: p.compareAt ? Math.round(p.compareAt * 100) : null,
      badge: p.badge ?? null,
      active: true,
    });
    addedProducts++;
  }

  const existing = await db.orm.public.Variant.where({ productId: row.id }).select('color', 'size').all();
  const have = new Set(existing.map((v) => `${v.color}|${v.size}`));
  const prefix = p.slug.split('-').map((w) => w[0]).join('').toUpperCase();

  for (const c of p.colors) {
    for (const size of p.sizes) {
      if (have.has(`${c.name}|${size}`)) continue;
      await db.orm.public.Variant.create({
        productId: row.id,
        color: c.name,
        size,
        sku: `GH-${prefix}-${slugify(c.name).toUpperCase()}-${size}`,
        stock: p.soldOut?.includes(size) ? 0 : STARTING_STOCK,
      });
      addedVariants++;
    }
  }
}

console.log(`Seed done: ${addedProducts} products and ${addedVariants} variants added.`);
await db.close();
