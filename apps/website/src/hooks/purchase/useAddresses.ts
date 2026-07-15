'use client';

import { useMemo } from 'react';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type CreateAddressPayload,
  type SavedAddress,
  type UpdateAddressPayload,
} from '@/services/purchase';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';
import { useApiQuery } from '@/hooks/useApiQuery';

/** `GET /v1/addresses` — the buyer's saved delivery addresses. Gate with `enabled`. */
export function usePurchaseAddresses(enabled = true) {
  return useApiQuery<SavedAddress[]>(
    () => (enabled ? listAddresses() : Promise.resolve([])),
    [enabled],
    { enabled, initialData: [] },
  );
}

/** `POST /v1/addresses` — save a new delivery address. */
export function useCreateAddress(
  options?: UseApiMutationOptions<SavedAddress, CreateAddressPayload>,
) {
  const fn = useMemo(() => (payload: CreateAddressPayload) => createAddress(payload), []);
  return useApiMutation(fn, options);
}

interface UpdateAddressVariables {
  id: string;
  payload: UpdateAddressPayload;
}

/** `PATCH /v1/addresses/:id` — edit a saved address (only the named fields). */
export function useUpdateAddress(
  options?: UseApiMutationOptions<SavedAddress, UpdateAddressVariables>,
) {
  const fn = useMemo(
    () =>
      ({ id, payload }: UpdateAddressVariables) =>
        updateAddress(id, payload),
    [],
  );
  return useApiMutation(fn, options);
}

/** `DELETE /v1/addresses/:id` — remove a saved address. */
export function useDeleteAddress(options?: UseApiMutationOptions<void, string>) {
  const fn = useMemo(() => (id: string) => deleteAddress(id), []);
  return useApiMutation(fn, options);
}
