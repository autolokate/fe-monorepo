"use client";

import { useMemo } from "react";
import { getOrderInvoice, type Invoice } from "@/services/purchase";
import { ApiError } from "@/lib/api/error";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `GET /v1/orders/:id/invoice` — fetches the GST invoice and opens the
 * pre-signed PDF (`downloadUrl`) in a new tab.
 */
export function useDownloadInvoice(options?: UseApiMutationOptions<Invoice, string>) {
  const fn = useMemo(
    () => async (orderId: string) => {
      const invoice = await getOrderInvoice(orderId);
      if (!invoice.downloadUrl) {
        throw new ApiError("Invoice PDF is not ready yet", 0, invoice);
      }
      window.open(invoice.downloadUrl, "_blank", "noopener,noreferrer");
      return invoice;
    },
    [],
  );
  return useApiMutation(fn, options);
}
