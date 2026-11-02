import { describe, expect, it } from 'vitest';

import { buildAdminBreadcrumbs, matchAdminRoute } from '@/layouts/admin-breadcrumbs';

describe('admin breadcrumbs', () => {
  it('maps a top-level page to section › page', () => {
    expect(buildAdminBreadcrumbs('/taxi/bookings')).toEqual([
      { label: 'Taxi' },
      { label: 'Bookings' },
    ]);
  });

  it('adds a linked parent and a detail crumb for nested routes', () => {
    expect(buildAdminBreadcrumbs('/taxi/bookings/bk_123')).toEqual([
      { label: 'Taxi' },
      { label: 'Bookings', to: '/taxi/bookings' },
      { label: 'Detail' },
    ]);
  });

  it('prefers the longest matching route', () => {
    expect(matchAdminRoute('/partners/kyc')?.label).toBe('KYC review');
    expect(matchAdminRoute('/partners/org_1')?.label).toBe('Directory');
    expect(matchAdminRoute('/discovery/reels')?.label).toBe('Reels');
  });

  it('ignores trailing slashes and unknown paths', () => {
    expect(buildAdminBreadcrumbs('/orders/')).toEqual([
      { label: 'Operations' },
      { label: 'Orders' },
    ]);
    expect(buildAdminBreadcrumbs('/nope')).toEqual([]);
  });
});
