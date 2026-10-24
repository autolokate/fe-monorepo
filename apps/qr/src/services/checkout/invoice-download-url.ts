/**
 * Map Nest `InvoiceDto` / api-client `OrderInvoiceDto` → absolute PDF URL.
 * Contract field is `downloadUrl` (presigned); legacy `invoiceUrl` is not returned.
 */
export function invoiceDownloadUrlFromDto(
  invoice: { downloadUrl?: string | null },
  apiBaseUrl: string,
): string | null {
  const rawUrl = typeof invoice.downloadUrl === 'string' ? invoice.downloadUrl.trim() : '';
  if (!rawUrl) {
    return null;
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  const base = apiBaseUrl.replace(/\/$/, '');
  return `${base}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
}
