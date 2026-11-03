import { describe, expect, it } from 'vitest';

import {
  attentionCount,
  attentionFromQueueStats,
  attentionTone,
  countListPage,
  formatAttentionCount,
  formatPaiseAsRupees,
  summarizeTaxiRevenue,
} from '@/services/dashboard/dashboard-attention';

describe('dashboard attention counts', () => {
  it('never presents a capped page as an exact total', () => {
    expect(formatAttentionCount(attentionCount(50, true))).toBe('50+');
    expect(formatAttentionCount(attentionCount(7, false))).toBe('7');
    expect(formatAttentionCount(attentionCount(0, false))).toBe('0');
  });

  it('rejects non-list responses instead of reporting a wrong count', () => {
    expect(countListPage([1, 2], true)).toEqual({ count: 2, capped: true });
    expect(() => countListPage({ items: [] }, false)).toThrow(/Unexpected response/);
    expect(formatAttentionCount({ count: Number.NaN, capped: false })).toBe('—');
  });

  it('is calm at zero and escalates by urgency otherwise', () => {
    expect(attentionTone(attentionCount(0, false), true)).toBe('calm');
    expect(attentionTone(attentionCount(2, false), true)).toBe('urgent');
    expect(attentionTone(attentionCount(2, false), false)).toBe('attention');
  });
});

describe('queue stats counters', () => {
  it('reads exact counters from GET /admin/v1/stats/queues (never capped)', () => {
    const value = attentionFromQueueStats({ taxiDisputed: 73 }, 'taxiDisputed');
    expect(value).toEqual({ count: 73, capped: false });
    expect(formatAttentionCount(value)).toBe('73');
  });

  it('rejects a missing or non-integer counter instead of guessing', () => {
    expect(() => attentionFromQueueStats({}, 'supportOpen')).toThrow(/Unexpected response/);
    expect(() => attentionFromQueueStats({ supportOpen: 1.5 }, 'supportOpen')).toThrow();
    expect(() => attentionFromQueueStats(null, 'supportOpen')).toThrow();
  });
});

describe('taxi revenue summary', () => {
  it('sums server paise by ledger kind', () => {
    const summary = summarizeTaxiRevenue(
      [
        { kind: 'ADVANCE_EARNED', amountPaise: 5000 },
        { kind: 'ADVANCE_EARNED', amountPaise: 2550 },
        { kind: 'ADVANCE_FORFEITED', amountPaise: 1000 },
        { kind: 'DEPOSIT_FORFEITED', amountPaise: 7000 },
      ],
      false,
    );
    expect(summary).toEqual({
      advanceEarnedPaise: 7550,
      advanceForfeitedPaise: 1000,
      depositForfeitedPaise: 7000,
      totalPaise: 15550,
      entries: 4,
      partial: false,
    });
  });

  it('ignores unknown kinds and flags partial pages', () => {
    const summary = summarizeTaxiRevenue(
      [{ kind: 'SOMETHING_NEW' as never, amountPaise: 999 }],
      true,
    );
    expect(summary.totalPaise).toBe(0);
    expect(summary.partial).toBe(true);
  });

  it('formats paise as rupees', () => {
    expect(formatPaiseAsRupees(15550)).toBe('₹155.50');
    expect(formatPaiseAsRupees(1250000)).toBe('₹12,500');
  });
});
