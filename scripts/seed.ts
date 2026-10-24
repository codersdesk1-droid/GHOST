// Load the starting catalog (src/data/products.ts) and store settings into the database.
// Safe to run any time: it only fills what is missing or empty, so anything edited
// in /admin is never overwritten.
// Run: npm run db:seed
import { config } from 'dotenv';
import { Pool } from 'pg';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from '../src/prisma/contract.d.ts';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };
import { products, slugify } from '../src/data/products.ts';
import { DEFAULT_SETTINGS } from '../src/data/defaults.ts';

config({ path: ['.env.local', '.env'], quiet: true });

const STARTING_STOCK = 24;

const db = postgres({
  contract: contractFromJson<Contract>(contractJson),
  pg: new Pool({ connectionString: process.env['DATABASE_URL']?.replace('sslmode=require', 'sslmode=verify-full'), max: 2 }),
});

const added = { products: 0, filled: 0, colors: 0, meters: 0, variants: 0, settings: 0 };

for (const [position, p] of products.entries()) {
  const editorial = {
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    fabric: p.fabric,
    gsm: p.gsm,
    fit: p.fit,
    details: p.details.join('\n'),
    care: p.care.join('\n'),
    sizes: p.sizes.join(','),
    position,
  };

  let row = await db.orm.public.Product.first({ slug: p.slug });
  if (!row) {
    row = await db.orm.public.Product.create({
      slug: p.slug,
      name: p.name,
      priceCents: Math.round(p.price * 100),
      compareAtCents: p.compareAt ? Math.round(p.compareAt * 100) : null,
      badge: p.badge ?? null,
      active: true,
      ...editorial,
    });
    added.products++;
  } else if (row.description === '' && row.sizes === '') {
    // Existing row from before the editorial columns existed: backfill them once.
    await db.orm.public.Product.where({ id: row.id }).update(editorial);
    added.filled++;
  }

  if (!(await db.orm.public.ProductColor.first({ productId: row.id }))) {
    for (const [i, c] of p.colors.entries()) {
      await db.orm.public.ProductColor.create({ productId: row.id, name: c.name, hex: c.hex, position: i });
      added.colors++;
    }
  }
  if (!(await db.orm.public.ProductMeter.first({ productId: row.id }))) {
    for (const [i, m] of p.meters.entries()) {
      await db.orm.public.ProductMeter.create({ productId: row.id, label: m.label, value: m.value, note: m.note, position: i });
      added.meters++;
    }
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
      added.variants++;
    }
  }
}

if (!(await db.orm.public.StoreSettings.first({ id: 1 }))) {
  await db.orm.public.StoreSettings.create({ id: 1, ...DEFAULT_SETTINGS });
  added.settings++;
}

console.log(
  `Seed done: ${added.products} products added, ${added.filled} backfilled, ${added.colors} colours, ` +
    `${added.meters} meters, ${added.variants} variants, ${added.settings ? 'settings created' : 'settings kept'}.`,
);
await db.close();
