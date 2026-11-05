import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchOwnershipClaimsPage = vi.fn();
vi.mock('@/services/ownership-claims/ownership-claims-service', () => ({
  fetchOwnershipClaimsPage: (...args: unknown[]) => fetchOwnershipClaimsPage(...args) as unknown,
  fetchOwnershipReviewAccess: vi.fn(),
  fetchVehicleOwnershipHistory: vi.fn(),
  reviewClaim: vi.fn(),
}));

const { fetchOwnershipClaimsForFilter } = await import('./useOwnershipClaims');

const claim = (id: string, status: string, createdAt: string) => ({ id, status, createdAt });
const page = (items: unknown[], nextCursor: string | null) => ({
  items,
  pagination: { limit: 50, cursor: null, nextCursor, hasMore: nextCursor !== null },
});

describe('fetchOwnershipClaimsForFilter', () => {
  beforeEach(() => {
    fetchOwnershipClaimsPage.mockReset();
  });

  it('PENDING reads SUBMITTED and UNDER_REVIEW and merges newest first (the dashboard queue)', async () => {
    fetchOwnershipClaimsPage.mockImplementation(({ status }: { status: string }) =>
      Promise.resolve(
        status === 'SUBMITTED'
          ? page([claim('a', 'SUBMITTED', '2026-11-01T10:00:00Z')], null)
          : page([claim('b', 'UNDER_REVIEW', '2026-11-02T10:00:00Z')], null),
      ),
    );
    const result = await fetchOwnershipClaimsForFilter('PENDING');
    expect(fetchOwnershipClaimsPage).toHaveBeenCalledTimes(2);
    expect(result.items.map((row) => row.id)).toEqual(['b', 'a']);
    expect(result.nextCursor).toBeUndefined();
  });

  it('ALL sends no status and pages with limit + cursor beyond the first 50', async () => {
    fetchOwnershipClaimsPage
      .mockResolvedValueOnce(page([], 'c1'))
      .mockResolvedValueOnce(page([], null));
    const first = await fetchOwnershipClaimsForFilter('ALL');
    expect(fetchOwnershipClaimsPage.mock.calls[0]?.[0]).toEqual({ limit: 50 });
    expect(first.nextCursor).toEqual({ ALL: 'c1' });
    const second = await fetchOwnershipClaimsForFilter('ALL', first.nextCursor);
    expect(fetchOwnershipClaimsPage.mock.calls[1]?.[0]).toEqual({ limit: 50, cursor: 'c1' });
    expect(second.nextCursor).toBeUndefined();
  });

  it('PENDING keeps paging only the stream that still has more', async () => {
    fetchOwnershipClaimsPage.mockImplementation(({ status }: { status: string }) =>
      Promise.resolve(status === 'SUBMITTED' ? page([], 's2') : page([], null)),
    );
    const first = await fetchOwnershipClaimsForFilter('PENDING');
    expect(first.nextCursor).toEqual({ SUBMITTED: 's2', UNDER_REVIEW: null });
    fetchOwnershipClaimsPage.mockClear();
    await fetchOwnershipClaimsForFilter('PENDING', first.nextCursor);
    expect(fetchOwnershipClaimsPage.mock.calls.map((call) => call[0] as unknown)).toEqual([
      { status: 'SUBMITTED', limit: 50, cursor: 's2' },
    ]);
  });

  it('a single status is passed through', async () => {
    fetchOwnershipClaimsPage.mockResolvedValue(page([], null));
    await fetchOwnershipClaimsForFilter('REJECTED');
    expect(fetchOwnershipClaimsPage.mock.calls[0]?.[0]).toEqual({ status: 'REJECTED', limit: 50 });
  });
});
