// Starting store settings, loaded into the database by `npm run db:seed`.
// After that, the owner edits them in /admin/settings. Policy text is one point per line.

export const DEFAULT_SETTINGS = {
  storeName: "Ghost",
  tagline: "Wear a vision",
  contactEmail: "hello@ghost.store",
  instagram: "ghost",
  announcement: "",
  shippingCents: 1200,
  freeShippingCents: 15000,
  policyShipping: [
    "Orders ship within 1–2 business days from our studio.",
    "Domestic delivery: 3–6 business days. International: 7–14 business days.",
    "Shipping is free on orders over $150; otherwise a flat $12 applies.",
    "You'll receive a tracking link by email as soon as your parcel leaves us.",
  ].join("\n"),
  policyReturns: [
    "Unworn, unwashed pieces with original tags can be returned within 14 days of delivery.",
    "Exchanges for a different size or colour are free, subject to stock.",
    "Limited and numbered pieces are final sale unless faulty.",
    "Refunds are issued to the original payment method within 5–7 business days of us receiving your return.",
  ].join("\n"),
  policyPrivacy: [
    "We collect only what we need to fulfil your order and, if you opt in, to email you about drops.",
    "We never sell your data. Payment details are handled by our payment provider and never stored by us.",
    "You can request a copy or deletion of your data at any time by emailing us.",
  ].join("\n"),
  policyTerms: [
    "Prices are listed in US dollars and may change between drops.",
    "Orders are confirmed only after payment is verified.",
    "Colours may vary slightly from what you see on screen.",
  ].join("\n"),
  policyContact: [
    "We reply within one business day.",
    "Instagram DMs are open for styling questions.",
    "For order issues, include your order number so we can help faster.",
  ].join("\n"),
};

export type StoreSettingsData = typeof DEFAULT_SETTINGS;

export const POLICY_PAGES = {
  shipping: { title: "Shipping", field: "policyShipping" },
  returns: { title: "Returns & exchanges", field: "policyReturns" },
  contact: { title: "Contact", field: "policyContact" },
  privacy: { title: "Privacy", field: "policyPrivacy" },
  terms: { title: "Terms", field: "policyTerms" },
} as const satisfies Record<string, { title: string; field: keyof StoreSettingsData }>;
