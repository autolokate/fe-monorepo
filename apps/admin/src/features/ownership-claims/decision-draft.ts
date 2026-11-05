import type { OwnershipDecision } from '@/features/ownership-claims/OwnershipDecisionDialog';

/**
 * Unsent decision remarks, kept per claim + decision so a step-up re-verification (which replaces
 * the whole console with "Confirm it's you") does not lose them. sessionStorage when available
 * (survives the gate and a reload in this tab), an in-memory map otherwise. Cleared on success.
 */
const PREFIX = 'admin.ownership-decision-draft:';
const RESUME_KEY = 'admin.ownership-decision-resume';
const memory = new Map<string, string>();

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  try {
    const value = storage()?.getItem(key);
    if (value != null) return value;
  } catch {
    // Blocked storage — fall back to memory.
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string | null): void {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    const store = storage();
    if (!store) return;
    if (value === null) store.removeItem(key);
    else store.setItem(key, value);
  } catch {
    // Memory copy is enough for this session.
  }
}

const draftKey = (claimId: string, decision: OwnershipDecision) =>
  `${PREFIX}${claimId}:${decision}`;

export function loadDecisionDraft(claimId: string, decision: OwnershipDecision): string {
  return read(draftKey(claimId, decision)) ?? '';
}

export function saveDecisionDraft(
  claimId: string,
  decision: OwnershipDecision,
  remarks: string,
): void {
  write(draftKey(claimId, decision), remarks.length > 0 ? remarks : null);
}

export type DecisionResume = { claimId: string; decision: OwnershipDecision };

/** Marks the decision being sent, so the console can reopen that claim after re-verification. */
export function markDecisionResume(resume: DecisionResume | null): void {
  write(RESUME_KEY, resume ? JSON.stringify(resume) : null);
}

export function readDecisionResume(): DecisionResume | null {
  const raw = read(RESUME_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DecisionResume>;
    return typeof parsed.claimId === 'string' &&
      (parsed.decision === 'APPROVED' || parsed.decision === 'REJECTED')
      ? { claimId: parsed.claimId, decision: parsed.decision }
      : null;
  } catch {
    return null;
  }
}

/** After a successful decision: forget the draft(s) and the resume marker for that claim. */
export function clearDecisionDraft(claimId: string): void {
  write(draftKey(claimId, 'APPROVED'), null);
  write(draftKey(claimId, 'REJECTED'), null);
  if (readDecisionResume()?.claimId === claimId) markDecisionResume(null);
}
