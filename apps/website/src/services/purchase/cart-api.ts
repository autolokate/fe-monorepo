'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/error';
import { PurchaseApi } from './client';
import type { Cart, CreateCartPayload, UpdateCartPayload } from './types';

interface Enveloped<T> {
  data?: T;
}

/**
 * POST /v1/cart — prices a plan + riders (bearer). Call this ONCE per flow to
 * mint the cart; use `updateCart` to re-price it afterwards (plan / qty / promo
 * changes) instead of minting a fresh cart each time.
 */
export async function createCart(payload: CreateCartPayload): Promise<Cart> {
  const body: CreateCartPayload = {
    planId: payload.planId,
    riderCount: payload.riderCount,
  };
  if (payload.promoCode?.trim()) body.promoCode = payload.promoCode.trim();

  const res = await PurchaseApi.post<Enveloped<Cart>>(endpoints.cart.create, body);
  const cart = res.data?.data;
  if (!cart?.cartId) throw new ApiError('Invalid cart response', 0, res.data);
  return cart;
}

/**
 * PATCH /v1/cart/:cartId — re-price the existing cart in place (bearer). Used
 * for every plan / rider / promo change after the initial `createCart`.
 */
export async function updateCart(payload: UpdateCartPayload): Promise<Cart> {
  const body: Record<string, unknown> = {
    planId: payload.planId,
    riderCount: payload.riderCount,
  };
  if (payload.promoCode?.trim()) body.promoCode = payload.promoCode.trim();
  if (payload.registration?.trim()) body.registration = payload.registration.trim();

  const res = await PurchaseApi.patch<Enveloped<Cart>>(endpoints.cart.update(payload.cartId), body);
  const cart = res.data?.data;
  if (!cart) throw new ApiError('Invalid cart response', 0, res.data);
  // Fall back to the id we patched in case the backend doesn't echo it.
  return { ...cart, cartId: cart.cartId || payload.cartId };
}
