import { describe, expect, it } from 'vitest';

import { adminOrderLabel } from '@/platform/utils/admin-order-label';

describe('adminOrderLabel', () => {
  it('shows the short order id when the server sends orderNumber: null', () => {
    expect(adminOrderLabel(null, 'eeeeeeee-ffff-4aaa-8bbb-cccccccccccc')).toBe('eeeeeeee');
  });

  it('prefers a real order number and falls back to — without an id', () => {
    expect(adminOrderLabel('ALK-1', 'eeeeeeee-ffff')).toBe('ALK-1');
    expect(adminOrderLabel(null, null)).toBe('—');
  });
});
