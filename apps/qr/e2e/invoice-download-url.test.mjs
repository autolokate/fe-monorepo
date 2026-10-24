/**
 * Focused contract test: QR invoice URL mapping uses Nest InvoiceDto.downloadUrl
 * (api-client OrderInvoiceDto), not a legacy invoiceUrl field.
 *
 * Run: node --experimental-strip-types --test e2e/invoice-download-url.test.mjs
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const helperPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../src/services/checkout/invoice-download-url.ts',
);

const { invoiceDownloadUrlFromDto } = await import(pathToFileURL(helperPath).href);

describe('invoiceDownloadUrlFromDto (OrderInvoiceDto.downloadUrl)', () => {
  it('returns absolute downloadUrl as-is', () => {
    const url = invoiceDownloadUrlFromDto(
      {
        invoiceNumber: 'ALK/2026-27/000123',
        issuedAt: '2026-10-25T00:00:00.000Z',
        totalPaise: 49900,
        downloadUrl: 'https://cdn.example/invoice.pdf?X-Amz-Signature=1',
      },
      'https://api.example',
    );
    assert.equal(url, 'https://cdn.example/invoice.pdf?X-Amz-Signature=1');
  });

  it('prefixes relative downloadUrl with apiBaseUrl', () => {
    assert.equal(
      invoiceDownloadUrlFromDto({ downloadUrl: '/v1/media/inv.pdf' }, 'https://api.example/'),
      'https://api.example/v1/media/inv.pdf',
    );
  });

  it('returns null when downloadUrl missing/blank (ignores legacy invoiceUrl)', () => {
    assert.equal(
      invoiceDownloadUrlFromDto(
        { invoiceUrl: 'https://legacy.example/nope.pdf', downloadUrl: '' },
        'https://api.example',
      ),
      null,
    );
    assert.equal(invoiceDownloadUrlFromDto({}, 'https://api.example'), null);
    assert.equal(invoiceDownloadUrlFromDto({ downloadUrl: '   ' }, 'https://api.example'), null);
  });
});
