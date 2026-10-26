import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * Maps to OpenAPI `CreateWebsiteCartDto` — POST /v1/cart. Nest rejects unknown keys,
 * so a QR `code` must never be sent here; QR promo previews use `POST /v1/promos/validate`.
 */
export type CreateCartBody = {
  planId: string;
  riderCount: number;
  registration?: string;
  promoCode?: string;
};

/** Maps to OpenAPI `UpdateWebsiteCartDto` — PATCH /v1/cart/{cartId} (plan + riders required). */
export type PatchCartBody = {
  planId: string;
  riderCount: number;
  registration?: string;
  /** Apply promo, or `null` to remove. */
  promoCode?: string | null;
};

/** Maps to OpenAPI `WebsiteCartDto` — envelope `data` on POST/GET/PATCH /v1/cart. */
export type CartDto = {
  cartId: string;
  planPricePaise: number;
  riderCoverPaise: number;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string | null;
  expiresAt: string;
};

/** POST /v1/cart — price the cart (R08 order summary snapshot). */
export async function createCart(client: ApiClient, body: CreateCartBody): Promise<CartDto> {
  const response = await client.post<unknown>(endpoints.cart.create, body);
  return unwrapEnvelope(response) as CartDto;
}

/** PATCH /v1/cart/{cartId} — re-price plan / riders / promo in place. */
export async function updateCart(
  client: ApiClient,
  cartId: string,
  body: PatchCartBody,
): Promise<CartDto> {
  const response = await client.patch<unknown>(endpoints.cart.detail(cartId), body);
  return unwrapEnvelope(response) as CartDto;
}

/** GET /v1/cart/{cartId} — re-read a priced cart. */
export async function getCart(client: ApiClient, cartId: string): Promise<CartDto> {
  const response = await client.get<unknown>(endpoints.cart.detail(cartId));
  return unwrapEnvelope(response) as CartDto;
}
