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

## How the store works

| Piece | Where |
|---|---|
| Product copy, sizes, colours, quality meters | `src/data/products.ts` |
| Prices, sale prices, badges, visibility, stock per colour and size | Database (edit in `/admin/products`) |
| Live catalog (copy + database, cached, refreshed on admin edits and sales) | `src/lib/catalog.ts` |
| Data contract (tables) | `src/prisma/contract.prisma` |
| Checkout: re-prices the bag from the database, creates a pending order and a Stripe Checkout Session | `src/app/api/checkout/route.ts` |
| Webhook: the only place orders become paid and stock is taken (signed, idempotent, row-locked) | `src/app/api/stripe/webhook/route.ts`, `src/lib/orders.ts` |
| Customer order history | `/account` |
| Admin: overview, products & stock, orders (status + tracking) | `/admin` |

Order flow: `pending` → (Stripe webhook) `paid` → `packed` → `shipped` → `delivered`. Expired or failed
checkouts become `cancelled`. A paid order whose stock ran out between checkout and payment becomes
`needs_attention`. Refunds are issued in the Stripe dashboard, then marked `refunded` in `/admin/orders`.

## Common tasks

- **Add a product:** add it to `src/data/products.ts`, then `npm run db:seed` (adds only what is missing).
- **Change the schema:** edit `src/prisma/contract.prisma`, run `npx prisma contract emit`, then
  `npx prisma migration plan --name <change>` and `npx prisma db migrate`.
- **Photos:** drop them in `public/products/<slug>/`. Start a filename with a colour slug
  (`void-black-1.jpg`) to tie it to that colour. Portrait 4:5, at least 1600px tall.

## Before taking real orders

1. Deploy to Vercel and add a Stripe webhook endpoint for `https://<your-domain>/api/stripe/webhook`
   (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`). Put its signing secret in Vercel as
   `STRIPE_WEBHOOK_SECRET`, and set `ADMIN_EMAILS` there too.
2. Claim the Stripe sandbox and the Clerk app, set the business name to GHOST, and switch to live keys.
3. Review the policy pages in `src/app/info/[slug]/page.tsx` and set up tax (Stripe Tax needs a registration).
4. Prisma Postgres Free allows few direct connections; move to the pooled endpoint before real traffic.
