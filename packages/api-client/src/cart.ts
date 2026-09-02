import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Maps to OpenAPI `CartBodyDto` — POST /v1/cart. */
export type CreateCartBody = {
  code?: string;
  planId: string;
  riderCount: number;
  /** Required for upgrade carts on a DISTRIBUTED prepaid code. */
  registration?: string;
  promoCode?: string;
};

/** Maps to OpenAPI `PatchCartBodyDto` — PATCH /v1/cart/{cartId}. */
export type PatchCartBody = {
  planId?: string;
  riderCount?: number;
  registration?: string;
  /** Apply promo, or `null` to remove. */
  promoCode?: string | null;
};

/** Maps to OpenAPI `CartDto` — envelope `data` on POST/GET/PATCH /v1/cart. */
export type CartDto = {
  cartId: string;
  planPricePaise: number;
  riderCoverPaise: number;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string;
  expiresAt: string;
};

/** POST /v1/cart — price the cart (R08 order summary snapshot). */
export async function createCart(client: ApiClient, body: CreateCartBody): Promise<CartDto> {
  const response = await client.post<unknown>(endpoints.cart.create, body);
  return unwrapEnvelope(response) as CartDto;
}

/** PATCH /v1/cart/{cartId} — edit promo / tier / riders in place. */
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
