# Ghost™ — Wear a vision

Streetwear store for GHOST: Next.js 16 (App Router, Cache Components), Tailwind CSS v4, Prisma ORM 8 on
Prisma Postgres, Clerk accounts and Stripe Checkout, hosted on Vercel.

## Run it

```bash
npm install
vercel env pull          # writes .env.local (database, Clerk, Stripe keys)
npm run dev              # http://localhost:3000
npm run build            # production build (emits the Prisma contract first)
```

Local-only settings live in `.env.development.local` (git-ignored, never overwritten by `vercel env pull`):

- `ADMIN_EMAILS`: comma-separated emails allowed into `/admin` (must be verified on the Clerk account).
- `STRIPE_WEBHOOK_SECRET`: signing secret for webhook events.

## Running the store (no code needed)

Sign in, then open `/admin` (also linked from `/account` for staff).

| Who | Can |
|---|---|
| **Owner** (anyone in `ADMIN_EMAILS`, or promoted in Staff) | Everything below, plus **Settings** and **Staff** |
| **Staff** | Products, photos, stock, orders |

- **Products** (`/admin/products`): create and edit pieces: name, web address, category, price and sale price,
  badge, words, fabric, fit, sizes, colours (with swatches) and the 0–4 quality ratings. Hide a product by
  unticking "Show this product on the store".
- **Photos** (on each product): upload from the computer or phone (stored in Vercel Blob), tag a photo to a
  colour or "every colour", reorder (the first is the main photo), describe it, delete it.
- **Stock** (on each product): how many of each colour and size. Paid orders take stock automatically.
- **Orders** (`/admin/orders`): see paid orders and addresses, move them to packed, shipped, delivered, add a
  tracking number. Marking an order **shipped** emails the customer.
- **Settings** (`/admin/settings`): store name, tagline, contact email, Instagram, announcement bar, shipping
  price and free-shipping threshold, and the text of the policy pages.
- **Staff** (`/admin/staff`): add someone by email as staff or owner; they sign in with that email.

## How it works

| Piece | Where |
|---|---|
| Data contract (tables) | `src/prisma/contract.prisma`, migrations in `migrations/` |
| Live catalog and settings (cached, refreshed on every admin save and sale) | `src/lib/catalog.ts`, `src/lib/settings.ts` |
| Checkout: re-prices from the database, shipping from settings, Stripe Checkout Session | `src/app/api/checkout/route.ts` |
| Webhook: the only place orders become paid and stock is taken (signed, idempotent, row-locked) | `src/app/api/stripe/webhook/route.ts`, `src/lib/orders.ts` |
| Order emails (confirmation, shipped) via Resend | `src/lib/email.ts` |
| Photo uploads (browser → Vercel Blob, staff-only tokens) | `src/app/api/admin/upload/route.ts` |
| Roles | `src/lib/auth.ts` |

`src/data/products.ts` and `src/data/defaults.ts` are only the starting data that `npm run db:seed` loads into an
empty database. After that, the database (edited in `/admin`) is the source of truth.

Order flow: `pending` → (Stripe webhook) `paid` → `packed` → `shipped` → `delivered`. Expired or failed
checkouts become `cancelled`. A paid order whose stock ran out between checkout and payment becomes
`needs_attention`. Refunds are issued in the Stripe dashboard, then marked `refunded` in `/admin/orders`.

## Environment

Set by the Vercel integrations: `DATABASE_URL` (Prisma Postgres), `CLERK_*`, `STRIPE_*`,
`BLOB_READ_WRITE_TOKEN` (Vercel Blob), `RESEND_API_KEY` (Resend). Set by hand: `ADMIN_EMAILS` (permanent
owners), `STRIPE_WEBHOOK_SECRET`, and optionally `EMAIL_FROM` (e.g. `Ghost <orders@yourdomain.com>` on a domain
verified in Resend; without it, Resend's test sender only reaches your own Resend account email).

Schema changes: edit the contract, `npx prisma contract emit`, `npx prisma migration plan --name <change>`,
`npx prisma db migrate`.

## Before taking real orders

1. Deploy to Vercel and add a Stripe webhook endpoint for `https://<your-domain>/api/stripe/webhook`
   (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`). Put its signing secret in Vercel as
   `STRIPE_WEBHOOK_SECRET`, and set `ADMIN_EMAILS` there too.
2. Claim the Stripe sandbox and the Clerk app, set the business name to GHOST, and switch to live keys.
3. Review the policy pages in `/admin/settings` and set up tax (Stripe Tax needs a registration).
4. Prisma Postgres Free allows few direct connections; move to the pooled endpoint before real traffic.
