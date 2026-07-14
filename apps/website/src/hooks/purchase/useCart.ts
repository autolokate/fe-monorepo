"use client";

import { useMemo } from "react";
import {
  createCart,
  updateCart,
  type Cart,
  type CreateCartPayload,
  type UpdateCartPayload,
} from "@/services/purchase";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `POST /v1/cart` — mints the cart, once per flow. Use `useUpdateCart` to
 * re-price it afterwards rather than creating a new cart each time.
 */
export function useCreateCart(options?: UseApiMutationOptions<Cart, CreateCartPayload>) {
  const fn = useMemo(() => (payload: CreateCartPayload) => createCart(payload), []);
  return useApiMutation(fn, options);
}

/**
 * `PATCH /v1/cart/:cartId` — re-prices the existing cart (plan / riders / promo)
 * in place.
 */
export function useUpdateCart(options?: UseApiMutationOptions<Cart, UpdateCartPayload>) {
  const fn = useMemo(() => (payload: UpdateCartPayload) => updateCart(payload), []);
  return useApiMutation(fn, options);
}
