import { describe, expect, it } from 'vitest';

import {
  clearDecisionDraft,
  loadDecisionDraft,
  markDecisionResume,
  readDecisionResume,
  saveDecisionDraft,
} from './decision-draft';

describe('decision draft (no sessionStorage → in-memory)', () => {
  it('keeps remarks per claim + decision until the decision succeeds', () => {
    saveDecisionDraft('c1', 'APPROVED', 'RC verified');
    saveDecisionDraft('c1', 'REJECTED', 'Blurry');
    saveDecisionDraft('c2', 'APPROVED', 'Other claim');
    markDecisionResume({ claimId: 'c1', decision: 'APPROVED' });

    expect(loadDecisionDraft('c1', 'APPROVED')).toBe('RC verified');
    expect(loadDecisionDraft('c1', 'REJECTED')).toBe('Blurry');
    expect(readDecisionResume()).toEqual({ claimId: 'c1', decision: 'APPROVED' });

    clearDecisionDraft('c1');
    expect(loadDecisionDraft('c1', 'APPROVED')).toBe('');
    expect(loadDecisionDraft('c1', 'REJECTED')).toBe('');
    expect(readDecisionResume()).toBeNull();
    expect(loadDecisionDraft('c2', 'APPROVED')).toBe('Other claim');
  });

  it('an emptied textarea forgets the draft', () => {
    saveDecisionDraft('c3', 'APPROVED', 'x');
    saveDecisionDraft('c3', 'APPROVED', '');
    expect(loadDecisionDraft('c3', 'APPROVED')).toBe('');
  });
});
