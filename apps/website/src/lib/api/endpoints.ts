import { endpoints as shared } from '@autolokate/api-client';

/**
 * Backend paths the website talks to.
 *
 * Every domain the shared `@autolokate/api-client` already models (auth, profile, plans,
 * cart, consents, legal, retail orders) is taken from there — one source of truth across
 * Admin / QR / Website. Only website-specific domains the shared client does not cover
 * (catalogue, prices, taxonomy, contact, booking slots/bookings, addresses) are listed here,
 * each verified against the Nest controllers on be-monorepo origin/dev.
 */
export const endpoints = {
  /** otp/request, otp/verify, refresh, logout, `profiles` (GET), `profile` (PATCH). */
  auth: shared.auth,
  /** Expert-session booking (website domain). Slots live under `/v1/booking-slots`. */
  bookings: {
    slots: '/v1/booking-slots',
    slotsByDate: (dateIso: string) => `/v1/booking-slots/${encodeURIComponent(dateIso)}`,
    create: '/v1/bookings/book',
    my: '/v1/bookings/my',
    byId: (id: string) => `/v1/bookings/${encodeURIComponent(id)}`,
    cancel: (id: string) => `/v1/bookings/${encodeURIComponent(id)}/cancel`,
  },
  catalogue: {
    brands: '/v1/catalogue/brands',
    brandBySlug: (slug: string) => `/v1/catalogue/brands/${encodeURIComponent(slug)}`,
    brandModels: (slug: string) => `/v1/catalogue/brands/${encodeURIComponent(slug)}/models`,
    models: '/v1/catalogue/models',
    modelDetails: (brandSlug: string, modelSlug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}`,
    modelVariants: (brandSlug: string, modelSlug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}/variants`,
    variantDetails: (brandSlug: string, modelSlug: string, variantSlug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}/variants/${encodeURIComponent(variantSlug)}`,
    trending: '/v1/catalogue/trending',
    search: '/v1/catalogue/search',
    /** Comma-separated variant UUIDs (`encodeURIComponent` each segment). */
    compare: (variantIds: string[]) => {
      const ids = variantIds
        .map((id) => encodeURIComponent(id.trim()))
        .filter(Boolean)
        .join(',');
      return `/v1/catalogue/compare?ids=${ids}`;
    },
  },
  taxonomy: {
    root: (category?: string) =>
      category ? `/v1/taxonomy?category=${encodeURIComponent(category)}` : '/v1/taxonomy',
  },
  prices: {
    tco: (variantId: string, city: string) =>
      `/v1/prices/tco/${encodeURIComponent(variantId)}?city=${encodeURIComponent(city)}`,
    emi: '/v1/prices/emi',
    fuel: '/v1/prices/fuel',
    fuelHistory: '/v1/prices/fuel/history',
    evSubsidies: '/v1/prices/ev-subsidies',
    resale: (variantId: string) => `/v1/prices/resale/${encodeURIComponent(variantId)}`,
  },
  contact: {
    submit: '/v1/contact-us',
  },
  plans: shared.plans,
  legal: {
    /** Legal notice list — carries the current `noticeVersion` a consent pins to. */
    documents: shared.legal.documents,
    document: (kind: string) => `/v1/legal/documents/${encodeURIComponent(kind)}`,
  },
  me: {
    consents: shared.consents.list,
    withdrawConsent: (purpose: string) => `/v1/me/consents/${encodeURIComponent(purpose)}/withdraw`,
  },
  addresses: {
    /** The buyer's saved delivery addresses, default first (bearer). */
    list: '/v1/addresses',
    /** Save a new delivery address (bearer). */
    create: '/v1/addresses',
    /** Edit (PATCH) or remove (DELETE) a saved address by id (bearer). */
    byId: (id: string) => `/v1/addresses/${encodeURIComponent(id)}`,
    /** Autocomplete predictions for a partial address (anonymous, session-billed). */
    suggest: '/v1/addresses/place/suggest',
    /** Resolve a picked prediction to a checkout-shaped address — CLOSES the session. */
    resolve: (placeId: string) => `/v1/addresses/place/${encodeURIComponent(placeId)}`,
  },
  cart: {
    create: shared.cart.create,
    /** Re-price an existing cart in place (same flow) instead of minting a new one. */
    update: shared.cart.detail,
  },
  /** Website retail (cart + address) orders. `/v1/orders` is the QR plan-commerce surface. */
  orders: shared.retailOrders,
} as const;
