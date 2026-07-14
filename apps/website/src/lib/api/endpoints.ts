/** All backend paths the FE talks to. Centralised so refactors are one-file changes. */
export const endpoints = {
  auth: {
    requestOtp: "/v1/auth/login/otp",
    /** Purchase-flow OTP request (new backend). */
    otpRequest: "/v1/auth/otp/request",
    /** Purchase-flow OTP verify (new backend). */
    otpVerify: "/v1/auth/otp/verify",
    verifyOtp: "/v1/auth/verify-otp",
    refresh: "/v1/auth/refresh",
    me: "/v1/auth/me",
    logout: "/v1/auth/logout",
  },
  bookings: {
    slots: "/v1/bookings/slots",
    slotsByDate: (dateIso: string) => `/v1/bookings/slots/${dateIso}`,
    create: "/v1/bookings/book",
    my: "/v1/bookings/my",
    byId: (id: string) => `/v1/bookings/${id}`,
    cancel: (id: string) => `/v1/bookings/${id}/cancel`,
  },
  payments: {
    createOrder: "/v1/payments/orders",
    verify: "/v1/payments/verify",
    byId: (id: string) => `/v1/payments/${id}`,
  },
  catalogue: {
    brands: "/v1/catalogue/brands",
    brandBySlug: (slug: string) => `/v1/catalogue/brands/${encodeURIComponent(slug)}`,
    brandModels: (slug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(slug)}/models`,
    models: "/v1/catalogue/models",
    modelDetails: (brandSlug: string, modelSlug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}`,
    modelVariants: (brandSlug: string, modelSlug: string) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}/variants`,
    variantDetails: (
      brandSlug: string,
      modelSlug: string,
      variantSlug: string,
    ) =>
      `/v1/catalogue/brands/${encodeURIComponent(brandSlug)}/models/${encodeURIComponent(modelSlug)}/variants/${encodeURIComponent(variantSlug)}`,
    trending: "/v1/catalogue/trending",
    search: "/v1/catalogue/search",
    /** Comma-separated variant UUIDs (`encodeURIComponent` each segment). */
    compare: (variantIds: string[]) => {
      const ids = variantIds.map((id) => encodeURIComponent(id.trim())).filter(Boolean).join(",");
      return `/v1/catalogue/compare?ids=${ids}`;
    },
  },
  taxonomy: {
    root: (category?: string) =>
      category
        ? `/v1/taxonomy?category=${encodeURIComponent(category)}`
        : "/v1/taxonomy",
  },
  prices: {
    tco: (variantId: string, city: string) =>
      `/v1/prices/tco/${encodeURIComponent(variantId)}?city=${encodeURIComponent(city)}`,
    emi: "/v1/prices/emi",
    fuel: "/v1/prices/fuel",
    fuelHistory: "/v1/prices/fuel/history",
    evSubsidies: "/v1/prices/ev-subsidies",
    resale: (variantId: string) =>
      `/v1/prices/resale/${encodeURIComponent(variantId)}`,
  },
  contact: {
    submit: "/v1/contact-us",
  },
  plans: {
    list: (sku: string) => `/v1/plans?sku=${encodeURIComponent(sku)}`,
  },
  legal: {
    /** Legal notice list — carries the current `noticeVersion` a consent pins to. */
    documents: "/v1/legal/documents",
    document: (kind: string) => `/v1/legal/documents/${encodeURIComponent(kind)}`,
  },
  me: {
    consents: "/v1/me/consents",
    withdrawConsent: (purpose: string) =>
      `/v1/me/consents/${encodeURIComponent(purpose)}/withdraw`,
  },
  profile: "/v1/profile",
  addresses: {
    /** The buyer's saved delivery addresses, default first (bearer). */
    list: "/v1/addresses",
    /** Save a new delivery address (bearer). */
    create: "/v1/addresses",
    /** Edit (PATCH) or remove (DELETE) a saved address by id (bearer). */
    byId: (id: string) => `/v1/addresses/${encodeURIComponent(id)}`,
    /** Autocomplete predictions for a partial address (anonymous, session-billed). */
    suggest: "/v1/addresses/place/suggest",
    /** Resolve a picked prediction to a checkout-shaped address — CLOSES the session. */
    resolve: (placeId: string) => `/v1/addresses/place/${encodeURIComponent(placeId)}`,
  },
  cart: {
    create: "/v1/cart",
    /** Re-price an existing cart in place (same flow) instead of minting a new one. */
    update: (id: string) => `/v1/cart/${encodeURIComponent(id)}`,
  },
  orders: {
    create: "/v1/orders",
    /** The buyer's own orders, newest first (bearer). */
    list: (limit = 20) => `/v1/orders?limit=${encodeURIComponent(String(limit))}`,
    byId: (id: string) => `/v1/orders/${encodeURIComponent(id)}`,
    pay: (id: string) => `/v1/orders/${encodeURIComponent(id)}/pay`,
    payment: (id: string) => `/v1/orders/${encodeURIComponent(id)}/payment`,
    invoice: (id: string) => `/v1/orders/${encodeURIComponent(id)}/invoice`,
  },
} as const;
