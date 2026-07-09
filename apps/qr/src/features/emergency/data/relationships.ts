import type { AlIconName } from '@autolokate/icons';

import type { RelationshipId } from '../types.js';

export type RelationshipOption = {
  id: RelationshipId;
  label: string;
  icon: AlIconName;
};

/** Figma E3 / R3 — 6 tiles (Spouse through Relative). */
export const CONTACT_RELATIONSHIP_OPTIONS: readonly RelationshipOption[] = [
  { id: 'spouse', label: 'Spouse', icon: 'heart' },
  { id: 'parent', label: 'Parent', icon: 'user' },
  { id: 'child', label: 'Child', icon: 'circle-user' },
  { id: 'sibling', label: 'Sibling', icon: 'users' },
  { id: 'friend', label: 'Friend', icon: 'smile' },
  { id: 'relative', label: 'Relative', icon: 'house' },
] as const;

/** @deprecated Use CONTACT_RELATIONSHIP_OPTIONS — Colleague/Other removed per product. */
export const RELATIONSHIP_OPTIONS: readonly RelationshipOption[] = CONTACT_RELATIONSHIP_OPTIONS;
