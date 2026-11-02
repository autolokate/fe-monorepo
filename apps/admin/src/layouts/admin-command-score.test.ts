import { describe, expect, it } from 'vitest';

import { scoreAdminCommand } from '@/layouts/admin-command-score';

describe('admin command palette scoring', () => {
  it('ranks the page whose name matches above description-only matches', () => {
    const revenue = scoreAdminCommand('Revenue', 'revenue', ['Taxi', 'Booking fees earned']);
    const kyc = scoreAdminCommand('KYC review', 'revenue', ['Partners', 'GST verification queue']);
    expect(revenue).toBeGreaterThan(kyc);
    expect(kyc).toBe(0);
  });

  it('matches word starts and descriptions', () => {
    expect(scoreAdminCommand('Ownership claims', 'claims')).toBe(0.9);
    expect(scoreAdminCommand('Tickets', 'support', ['Customer support tickets'])).toBe(0.6);
    expect(scoreAdminCommand('Bookings', 'dispute', ['Taxi bookings, disputes'])).toBe(0.6);
  });

  it('falls back to in-order characters on the label only', () => {
    expect(scoreAdminCommand('Taxi policy', 'txp')).toBe(0.3);
    expect(scoreAdminCommand('Orders', 'zzz')).toBe(0);
  });

  it('treats recent entries like their page and empty search as a match', () => {
    expect(scoreAdminCommand('recent:Revenue', 'rev')).toBe(0.95);
    expect(scoreAdminCommand('Orders', '  ')).toBe(1);
  });
});
