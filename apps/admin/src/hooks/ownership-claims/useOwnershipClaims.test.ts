import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchOwnershipClaims = vi.fn();
vi.mock('@/services/ownership-claims/ownership-claims-service', () => ({
  fetchOwnershipClaims: (...args: unknown[]) => fetchOwnershipClaims(...args) as unknown,
  reviewClaim: vi.fn(),
}));

const { fetchOwnershipClaimsForFilter } = await import('./useOwnershipClaims');

const claim = (id: string, status: string, createdAt: string) => ({ id, status, createdAt });

describe('fetchOwnershipClaimsForFilter', () => {
  beforeEach(() => {
    fetchOwnershipClaims.mockReset();
  });

  it('PENDING reads SUBMITTED and UNDER_REVIEW and merges newest first (the dashboard queue)', async () => {
    fetchOwnershipClaims.mockImplementation(({ status }: { status: string }) =>
      Promise.resolve(
        status === 'SUBMITTED'
          ? [claim('a', 'SUBMITTED', '2026-11-01T10:00:00Z')]
          : [claim('b', 'UNDER_REVIEW', '2026-11-02T10:00:00Z')],
      ),
    );
    const rows = await fetchOwnershipClaimsForFilter('PENDING');
    expect(fetchOwnershipClaims).toHaveBeenCalledTimes(2);
    expect(rows.map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('ALL sends no status; a single status is passed through', async () => {
    fetchOwnershipClaims.mockResolvedValue([]);
    await fetchOwnershipClaimsForFilter('ALL');
    await fetchOwnershipClaimsForFilter('REJECTED');
    expect(fetchOwnershipClaims.mock.calls.map((call) => call[0] as unknown)).toEqual([
      {},
      { status: 'REJECTED' },
    ]);
  });
});
