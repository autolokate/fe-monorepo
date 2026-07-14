"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/error";
import { PurchaseApi } from "./client";

/**
 * Google-backed address autocomplete, proxied anonymously through our backend.
 *
 * Billing is per *session*, not per keystroke. The whole picker — every
 * `suggest` call plus the final `resolve` — must ride one server-minted session
 * handle. The three rules that make up the contract:
 *
 *   1. MINT   — omit `session` on the first keystroke; the server mints one.
 *   2. ECHO   — send that same handle back on every later keystroke.
 *   3. CLOSE  — send it on `resolve`; that closes the billed session.
 *
 * Get any of these wrong and each keystroke bills as its own vendor session.
 */

/** Below this many characters we answer locally and never call the vendor. */
export const ADDRESS_MIN_QUERY = 3;

export interface AddressSuggestion {
  /** Opaque vendor id — pass to `resolveAddress`. */
  placeId: string;
  /** The prediction headline, e.g. "Rajiv Chowk Metro Station". */
  primary: string;
  /** The disambiguating tail, e.g. "Connaught Place, New Delhi, Delhi". */
  secondary?: string;
}

export interface AddressSuggestResult {
  /** Server-minted handle to echo on the next keystroke and on the resolve. */
  session: string;
  suggestions: AddressSuggestion[];
}

/**
 * Checkout-shaped dispatch address. Only `line1` is guaranteed — every other
 * field can come back empty (some places genuinely have no PIN), so treat this
 * strictly as a prefill: keep the form editable and validate PIN yourself.
 */
export interface ResolvedAddress {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Enveloped<T> {
  data?: T;
}

/**
 * A saved delivery address (`GET /v1/addresses`). Contact details come back
 * MASKED — `phoneMasked` is the last four digits, `emailMasked` a partial —
 * so they're safe to render but can't be re-submitted verbatim on an edit.
 */
export interface SavedAddress {
  /** Send this as `addressId` on `POST /v1/orders`. */
  id: string;
  /** The buyer's own label ("Home", "Office"), or null. */
  label: string | null;
  name: string;
  /** Last 4 digits only, e.g. "••••3210". */
  phoneMasked: string;
  /** Partially masked, e.g. "p••••@example.com", or null. */
  emailMasked: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  /** Pre-selected at checkout. At most one per account. */
  isDefault: boolean;
}

/**
 * Body for `POST /v1/addresses`. Only `line1`, `city`, `state`, `pincode` are
 * required — `name`/`phone` default to the buyer's profile + login number, and
 * `email` is optional (the account is phone-first).
 */
export interface CreateAddressPayload {
  label?: string;
  name?: string;
  phone?: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  /** Make this the default (demotes the incumbent). First address auto-defaults. */
  isDefault?: boolean;
}

/** Body for `PATCH /v1/addresses/{id}` — send only the fields you're changing. */
export type UpdateAddressPayload = Partial<CreateAddressPayload>;

/** Drop empty / whitespace-only strings so we never overwrite a field with "". */
function pruneAddressBody(
  payload: CreateAddressPayload | UpdateAddressPayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) body[key] = trimmed;
    } else if (value !== undefined) {
      body[key] = value;
    }
  }
  return body;
}

/**
 * Shares one in-flight `GET /v1/addresses` across concurrent callers. React
 * StrictMode (dev) fires the query effect twice on mount, so without this we'd
 * hit the network twice; the promise is cleared once it settles, so later
 * refetches (e.g. after a delete) still go out fresh.
 */
let listInFlight: Promise<SavedAddress[]> | null = null;

/** GET /v1/addresses — the buyer's saved delivery addresses, default first (bearer). */
export function listAddresses(): Promise<SavedAddress[]> {
  if (listInFlight) return listInFlight;
  listInFlight = (async () => {
    try {
      const res = await PurchaseApi.get<Enveloped<SavedAddress[]>>(
        endpoints.addresses.list,
      );
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } finally {
      listInFlight = null;
    }
  })();
  return listInFlight;
}

/** POST /v1/addresses — save a new delivery address (bearer). */
export async function createAddress(payload: CreateAddressPayload): Promise<SavedAddress> {
  const res = await PurchaseApi.post<Enveloped<SavedAddress>>(
    endpoints.addresses.create,
    pruneAddressBody(payload),
  );
  const data = res.data?.data;
  if (!data?.id) throw new ApiError("Invalid address response", 0, res.data);
  return data;
}

/** PATCH /v1/addresses/{id} — edit a saved address (only the named fields, bearer). */
export async function updateAddress(
  id: string,
  payload: UpdateAddressPayload,
): Promise<SavedAddress> {
  const res = await PurchaseApi.patch<Enveloped<SavedAddress>>(
    endpoints.addresses.byId(id),
    pruneAddressBody(payload),
  );
  const data = res.data?.data;
  if (!data?.id) throw new ApiError("Invalid address response", 0, res.data);
  return data;
}

/** DELETE /v1/addresses/{id} — remove a saved address (bearer, 204). */
export async function deleteAddress(id: string): Promise<void> {
  await PurchaseApi.delete(endpoints.addresses.byId(id));
}

/**
 * GET /v1/addresses/suggest — autocomplete predictions for a partial address.
 *
 * @param q        What the buyer has typed.
 * @param session  The handle from the previous `suggest` in this picker. Omit
 *                 on the first keystroke so the server mints a fresh one.
 */
export async function suggestAddresses(
  q: string,
  session?: string,
): Promise<AddressSuggestResult> {
  const res = await PurchaseApi.get<Enveloped<AddressSuggestResult>>(
    endpoints.addresses.suggest,
    { params: session ? { q, session } : { q } },
  );
  const data = res.data?.data;
  if (!data?.session) {
    throw new ApiError("Invalid address suggestions response", 0, res.data);
  }
  return {
    session: data.session,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}

/**
 * GET /v1/addresses/{placeId} — resolve a picked prediction to a dispatch
 * address. Passing `session` CLOSES that billing session; a missing/expired
 * handle still resolves (billed unsessioned) so checkout never fails over a
 * billing optimisation.
 */
export async function resolveAddress(
  placeId: string,
  session?: string,
): Promise<ResolvedAddress> {
  const res = await PurchaseApi.get<Enveloped<ResolvedAddress>>(
    endpoints.addresses.resolve(placeId),
    { params: session ? { session } : {} },
  );
  const data = res.data?.data;
  if (!data?.line1) {
    throw new ApiError("Invalid address response", 0, res.data);
  }
  return data;
}
