import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Maps to OpenAPI `CreateCartBodyDto`. */
export type CreateCartBody = {
  code: string;
  planId: string;
  riderCount: number;
  promoCode?: string;
};

/** Maps to OpenAPI `CartDto` — envelope `data` on POST/GET /v1/cart. */
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

/** GET /v1/cart/{cartId} — re-read a priced cart. */
export async function getCart(client: ApiClient, cartId: string): Promise<CartDto> {
  const response = await client.get<unknown>(endpoints.cart.detail(cartId));
  return unwrapEnvelope(response) as CartDto;
}
