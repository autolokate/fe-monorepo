'use client';

import { useMemo } from 'react';
import {
  createOrder,
  payOrder,
  type CreateOrderPayload,
  type Order,
  type PaymentRef,
  type PayOrderPayload,
} from '@/services/purchase';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

/** `POST /v1/orders` — creates the order from the latest cart + address. */
export function useCreateOrder(options?: UseApiMutationOptions<Order, CreateOrderPayload>) {
  const fn = useMemo(() => (payload: CreateOrderPayload) => createOrder(payload), []);
  return useApiMutation(fn, options);
}

interface PayVariables {
  orderId: string;
  payload: PayOrderPayload;
}

/** `POST /v1/orders/:id/pay` — starts payment + optional auto-renew mandate. */
export function usePayOrder(options?: UseApiMutationOptions<PaymentRef, PayVariables>) {
  const fn = useMemo(
    () =>
      ({ orderId, payload }: PayVariables) =>
        payOrder(orderId, payload),
    [],
  );
  return useApiMutation(fn, options);
}
