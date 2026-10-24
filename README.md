# Ghost™ — Wear a vision

Storefront for GHOST, built with Next.js 16 (App Router), TypeScript and Tailwind CSS v4.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Adding your clothing photos

1. Create a folder per product inside `public/products/`, named after the product's `slug`
   (see `src/data/products.ts`):

   ```
   public/products/phantom-oversized-tee/
     void-black-1.jpg      ← shown when "Void Black" is selected
     void-black-2.jpg
     bone-1.jpg            ← shown when "Bone" is selected
   ```

2. Files are sorted by name; the first is the main image and the second appears on hover in grids.
   Start a filename with a colour slug (`void-black`, `bone`, `ash`, `fog`, `moss`) to tie it to that colour;
   otherwise it's shown for every colour.
3. Use portrait photos (4:5 works best), at least 1600px tall, JPG/WEBP/AVIF.
4. Restart `npm run dev` (or rebuild) after adding photos. Products without photos show a rendered placeholder.

## Editing products

Everything lives in **`src/data/products.ts`** — names, USD prices, sale prices, colours, sizes, sold-out sizes,
fabric weight (GSM), quality meters, details and care. The homepage hero picks its three pieces in `src/app/page.tsx` (`HERO`).

## What's here (phase 1)

- Home: hero carousel with glass hotspot cards, category tabs + product strip, quality anatomy, manifesto, best sellers, FAQ
- Shop with category filters and sorting, product pages (gallery + zoom, colour/size, size chart, quality meters)
- Bag drawer + bag page (saved in the browser), FAQ, Quality, policy pages, 404

## Phase 2 (from the roadmap)

PostgreSQL + Prisma for products/inventory/orders, accounts, server-validated checkout with Razorpay/Stripe
(verified webhooks), transactional email, admin dashboard, analytics. The checkout button currently shows a
"coming soon" notice — prices in the browser are never trusted for payment.
