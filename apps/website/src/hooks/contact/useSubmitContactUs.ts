"use client";

import { useMemo } from "react";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";
import { submitContactUs } from "@/services/contact";
import type { ContactUsPayload, ContactUsResponse } from "@/services/contact/types";

/**
 * `POST /v1/contact-us` — submits the public contact form.
 *
 * @example
 *   const { mutate, isLoading } = useSubmitContactUs({
 *     onSuccess: () => setSuccess(true),
 *   });
 *   await mutate({ name, number, email, message });
 */
export function useSubmitContactUs(
  options?: UseApiMutationOptions<ContactUsResponse, ContactUsPayload>,
) {
  const fn = useMemo(() => (payload: ContactUsPayload) => submitContactUs(payload), []);
  return useApiMutation(fn, { errorToast: false, ...options });
}
